const SolidityFunction = require('web3/lib/web3/function')
const _ = require('lodash')
const ultralightbeamValidator = require('./validators/ultralightbeam')
const arrayValidator = require('./validators/array')
const amorphAddressValidator = require('./validators/amorphAddress')
const stringValidator = require('./validators/string')
const stripType = require('./stripType')
const Amorph = require('./Amorph')
const TransactionRequest = require('./TransactionRequest')
const blockFlags = require('./blockFlags')

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

SolWrapper.prototype.getCalldata = function getCalldata(solidityMethodName, _inputs) {
  const solidityFunction = this.solidityFunctions[solidityMethodName]
  const inputs = _inputs ? _inputs.map((input, index) => {
    const strippedType = stripType(solidityFunction._inputTypes[index])
    const form = `web3.${strippedType}`
    if(!_.isArray(input)) {
      return input.to(form)
    }
    return input.map((_input) => {
      return _input.to(form)
    })
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

  return this.ultralightbeam.eth.call(transactionRequest, blockFlags.latest).then((bytes) => {

    const formatted = solidityFunction.unpackOutput(
      bytes.to('hex.prefixed')
    )

    if (solidityFunction._outputTypes.length === 1) {
      // Single return value
      const strippedType = stripType(solidityFunction._outputTypes[0])
      const form = `web3.${strippedType}`
      if (!_.isArray(formatted)) {
        return new Amorph(formatted, form)
      }
      return formatted.map((_formatted) => {
        return new Amorph(_formatted, form)
      })
    }

    // Multiple return values
    return formatted.map((_formatted, index) => {
      const strippedType = stripType(solidityFunction._outputTypes[index])
      const form = `web3.${strippedType}`
      if(!_.isArray(_formatted)) {
        return new Amorph(_formatted, form)
      }
      return _formatted.map((__formatted) => {
        return new Amorph(__formatted, form)
      })
    })
  })

}

module.exports = SolWrapper
