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

TransactionRequest.prototype.defaults = function defaults(_defaults) {
  _.forEach(_defaults, (value, key) => {
    if(key in transactionRequestFields) {
      if (key in this.values) {
        return
      }
      this[key](value)
    }
  })
  return this
}

TransactionRequest.prototype.toPojo = function toPojo() {
  const pojo = {}
  _.forEach(this.values, (value, key) => {
    if (key === 'from') {
      pojo[key] = value.address.to('hex.prefixed')
    } else {
      pojo[key] = value.to('hex.prefixed')
    }
  })
  return pojo
}

TransactionRequest.prototype.toRawSigned = function toRawSigned() {
  const tx = new Tx(this.toPojo())
  tx.sign(this.values.from.privateKey.to('buffer'))
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
