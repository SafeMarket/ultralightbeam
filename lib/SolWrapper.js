const SolidityFunction = require('web3/lib/web3/function')
const _ = require('lodash')
const ultralightbeamValidator = require('./validators/ultralightbeam')
const arrayValidator = require('./validators/array')
const amorphAddressValidator = require('./validators/amorphAddress')
const stringValidator = require('./validators/string')
const stripType = require('./stripType')
const Amorph = require('./Amorph')
const TransactionRequest = require('./TransactionRequest')

function SolWrapper(ultralightbeam, abi, address) {

  ultralightbeamValidator.validate('SolWrapper argument #0', ultralightbeam)
  arrayValidator.validate('SolWrapper argument #1', abi)
  amorphAddressValidator.validate('SolWrapper argument #2', address, true)

  _.merge(this, { ultralightbeam, abi, address })

  this.solidityFunctions = {}
  this.outputNames = {}

  abi.filter((pojo) => {
    return pojo.type === 'function'
  }).map((pojo) => {
    const solidityFunction = new SolidityFunction(null, pojo, null)
    const methodName = solidityFunction._name
    this.solidityFunctions[methodName] = solidityFunction
    const outputNames = pojo.outputs.map((output) => {
      return output.name
    })
    if (outputNames.indexOf('') === -1) {
      this.outputNames[methodName] = outputNames
    }
  })
}

function unamorphify(type, input) {
  if(_.isArray(input)) {
    return input.map((_input) => {
      return unamorphify(type, _input)
    })
  }
  const strippedType = stripType(type)
  const form = `web3.${strippedType}`
  return input.to(form)
}

function reamorphify(type, output) {
  const strippedType = stripType(type)
  if (!_.isArray(output)) {
    const form = `web3.${strippedType}`
    return new Amorph(output, form)
  }
  return output.map((_output) => {
    return reamorphify(type, _output)
  })
}

SolWrapper.prototype.getCalldata = function getCalldata(solidityMethodName, _inputs) {
  const solidityFunction = this.solidityFunctions[solidityMethodName]
  const inputs = _inputs ? _inputs.map((input, index) => {
    const type = solidityFunction._inputTypes[index]
    return unamorphify(type, input)
  }) : []
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  return new Amorph(dataHexPrefixed, 'hex.prefixed')
}

SolWrapper.prototype.getTransactionRequest = function getTransactionRequest(
  solidityMethodName, inputs
) {
  const data = this.getCalldata(solidityMethodName, inputs)
  return new TransactionRequest({ data, to: this.address })
}

SolWrapper.prototype.broadcast = function broadcast(solidityMethodName, inputs) {
  const transactionRequest = this.getTransactionRequest(solidityMethodName, inputs)
  return this.ultralightbeam.sendTransaction(transactionRequest)
}

SolWrapper.prototype.fetch = function fetch(solidityMethodName, inputs) {

  const transactionRequest = this.getTransactionRequest(solidityMethodName, inputs)
  const solidityFunction = this.solidityFunctions[solidityMethodName]

  return this.ultralightbeam.eth.call(transactionRequest).then((bytes) => {

    const output = solidityFunction.unpackOutput(
      bytes.to('hex.prefixed')
    )

    if (solidityFunction._outputTypes.length === 1) {
      // Single return value
      const type = solidityFunction._outputTypes[0]
      return reamorphify(type, output)
    }

    // Multiple return values
    const outputs = output.map((_output, index) => {
      const type = solidityFunction._outputTypes[index]
      return reamorphify(type, _output)
    })

    const outputNames = this.outputNames[solidityMethodName]
    if (outputNames) {
      const namedOutputs = {}
      outputs.forEach((_output, index) => {
        namedOutputs[outputNames[index]] = _output
      })
      return namedOutputs
    }

    return outputs
  })

}

module.exports = SolWrapper
