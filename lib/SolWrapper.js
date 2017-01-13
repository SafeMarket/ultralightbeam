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
    return input.to(form)
  }) : []
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  return new Amorph(dataHexPrefixed, 'hex.prefixed')
}

SolWrapper.prototype.broadcast = function broadcast(solidityMethodName, inputs) {
  const data = this.getCalldata(solidityMethodName, inputs)
  const transactionRequest = new TransactionRequest({ data, to: this.address })
  return this.ultralightbeam.sendTransaction(transactionRequest)
}

SolWrapper.prototype.fetch = function fetch(solidityMethodName, inputs) {
  const data = this.getCalldata(solidityMethodName, inputs)
  const transactionRequest = new TransactionRequest({ data, to: this.address })

  const solidityFunction = this.solidityFunctions[solidityMethodName]
  return this.ultralightbeam.eth.call(transactionRequest, blockFlags.latest).then((bytes) => {
    const formatted = solidityFunction.unpackOutput(
      bytes.to('hex.prefixed')
    )

    if (_.isArray(formatted)) {
      return formatted.map((_formatted, index) => {
        const strippedType = stripType(solidityFunction._outputTypes[index])
        const form = `web3.${strippedType}`
        return new Amorph(_formatted, form)
      })
    }

    const strippedType = stripType(solidityFunction._outputTypes[0])
    const form = `web3.${strippedType}`
    return new Amorph(formatted, form)
  })
}

module.exports = SolWrapper
