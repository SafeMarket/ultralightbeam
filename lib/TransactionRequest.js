const _ = require('lodash')
const Tx = require('ethereumjs-tx')
const Amorph = require('./Amorph')
const transactionRequestFields = require('./transactionRequestFields')
const transactionRequestFieldValidator = require(
  './validators/transactionRequestField'
)
const accountValidator = require('./validators/account')
const amorphNaturalNumberValidator = require('./validators/amorphNaturalNumber')

function TransactionRequest(ultralightbeam, values) {

  this.ultralightbeam = ultralightbeam
  this.values = values || {}
  _.forEach(this.values, (value, key) => {
    transactionRequestFieldValidator.validate('TransactionRequest value', key)
    this.set(key, value)
  })
  if (!this.values.from && ultralightbeam && ultralightbeam.options.defaultAccount) {
    this.set('from', ultralightbeam.options.defaultAccount)
  }
}

TransactionRequest.prototype.set = function set(key, value) {
  transactionRequestFields[key].validate(`TransactionRequest.set ${key}`, value)
  this.values[key] = value
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
  accountValidator.validate('transactionRequest.values.from', this.values.from)
  amorphNaturalNumberValidator.validate('transactionRequest.values.nonce', this.values.nonce)

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

TransactionRequest.prototype.send = function send() {
  return this.ultralightbeam.send(this)
}

TransactionRequest.prototype.estimateGas = function estimateGas() {
  return this.ultralightbeam.eth.estimateGas(this)
}

module.exports = TransactionRequest
