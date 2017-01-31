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

  abi.filter((json) => {
    return json.type === 'function'
  }).map((json) => {
    const solidityFunction = new SolidityFunction(null, json, null)
    this.solidityFunctions[solidityFunction._name] = solidityFunction
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
    return output.map((_output, index) => {
      const type = solidityFunction._outputTypes[index]
      return reamorphify(type, _output)
    })
  })

}

module.exports = SolWrapper
