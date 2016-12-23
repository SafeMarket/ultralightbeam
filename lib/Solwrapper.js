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

function Solwrapper(ultralightbeam, abi, address) {

  ultralightbeamValidator.validate('Solwrapper argument #0', ultralightbeam)
  arrayValidator.validate('Solwrapper argument #1', abi)
  amorphAddressValidator.validate('Solwrapper argument #2', address)

  _.merge(this, { ultralightbeam, abi, address })

  this.solidityFunctions = {}

  abi.filter((json) => {
    return json.type === 'function'
  }).map((json) => {
    const solidityFunction = new SolidityFunction(null, json, null)
    this.solidityFunctions[solidityFunction._name] = solidityFunction
  })
}

Solwrapper.prototype.get = function get(solidityFunctionName, _inputs) {

  stringValidator.validate('solwrapper.get argument #0', solidityFunctionName)
  arrayValidator.validate('solwrapper.get argument #1', _inputs, true)

  const solidityFunction = this.solidityFunctions[solidityFunctionName]
  const inputs = _inputs ? _inputs.map((input, index) => {
    const strippedType = stripType(solidityFunction._inputTypes[index])
    const form = `web3.${strippedType}`
    return input.to(form)
  }) : []
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  const data = new Amorph(dataHexPrefixed, 'hex.prefixed')
  const transactionRequest = new TransactionRequest({ data, to: this.address })

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

Solwrapper.prototype.set = function set(solidityFunctionName, _inputs) {
  const solidityFunction = this.solidityFunctions[solidityFunctionName]
  const inputs = _inputs ? _inputs.map((input, index) => {
    const strippedType = stripType(solidityFunction._inputTypes[index])
    const form = `web3.${strippedType}`
    return input.to(form)
  }) : []
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  const data = new Amorph(dataHexPrefixed, 'hex.prefixed')
  const transactionRequest = new TransactionRequest({ data, to: this.address })
  return this.ultralightbeam.sendTransaction(transactionRequest)
}

module.exports = Solwrapper
