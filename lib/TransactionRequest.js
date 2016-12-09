const _ = require('lodash')
const Tx = require('ethereumjs-tx')
const Amorph = require('./Amorph')
const transactionRequestFields = require('./transactionRequestFields')
const transactionRequestFieldValidator = require(
  './validators/transactionRequestField'
)

function TransactionRequest(values) {
  this.values = values || {}
  _.forEach(this.values, (value, key) => {
    transactionRequestFieldValidator.validate('TransactionRequest value', key)
    this[key](value)
  })
}

_.forEach(transactionRequestFields, (validator, key) => {
  TransactionRequest.prototype[key] = function setValue(value) {
    transactionRequestFields[key].validate(`TransactionRequest.${key}`, value)
    this.values[key] = value
    return this
  }
  Object.defineProperty(
    TransactionRequest.prototype[key], 'name', { value: key }
  )
})

TransactionRequest.prototype.toPojo = function toPojo() {
  const pojo = {}
  _.forEach(this.values, (value, key) => {
    pojo[key] = value.to('hex.prefixed')
  })
  return pojo
}

TransactionRequest.prototype.toParam = function toParam(_defaults) {

  const pojo = this.toPojo()
  const defaults = _defaults || {}

  if (!pojo.from && defaults.from) {
    pojo.from = defaults.from.to('hex.prefixed')
  }
  if (!pojo.gas && defaults.gas) {
    pojo.gas = defaults.gas.to('hex.prefixed')
  }
  if (!pojo.gasPrice && defaults.gasPrice) {
    pojo.gasPrice = defaults.gasPrice.to('hex.prefixed')
  }

  return pojo

}

TransactionRequest.prototype.sign = function sign(privateKey) {
  const tx = new Tx(this.toPojo())
  tx.sign(privateKey.to('buffer'))
  return new Amorph(tx.serialize(), 'buffer')
}

TransactionRequest.prototype.serialize = function serialize() {
  const tx = new Tx(this.toPojo())
  return new Amorph(tx.serialize(), 'buffer')
}

TransactionRequest.prototype.toString = function toString() {
  return `[TransactionRequest ${this.toPojo()}]`
}

module.exports = TransactionRequest
