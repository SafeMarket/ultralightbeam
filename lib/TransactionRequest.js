const _ = require('lodash')
const Tx = require('ethereumjs-tx')
const Amorph = require('./Amorph')
const transactionRequestFields = require('./transactionRequestFields')
const transactionRequestFieldValidator = require('./validators/transactionRequestField')
const errors = require('./errors')
const arguguard = require('arguguard')

function TransactionRequest(ultralightbeam, values) {
  arguguard('TransactionRequest', [Object, Object], arguments)
  this.ultralightbeam = ultralightbeam
  this.values = values || {}
  _.forEach(this.values, (value, key) => {
    this.set(key, value)
  })
  if (!this.values.from && ultralightbeam && ultralightbeam.options.defaultAccount) {
    this.set('from', ultralightbeam.options.defaultAccount)
  }
}

TransactionRequest.prototype.set = function set(key, value) {
  arguguard('transactionRequest.set', [transactionRequestFieldValidator, transactionRequestFields[key] || 'undefined'], arguments)
  this.values[key] = value
}

TransactionRequest.prototype.toPojo = function toPojo() {
  arguguard('transactionRequest.toPojo', [], arguments)
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
  arguguard('transactionRequest.toRawSigned', [], arguments)
  if (!this.values.from) {
    throw new errors.MissingFromError('transactionRequest.values.from cannot be empty')
  }
  if (!this.values.nonce) {
    throw new errors.MissingNonceError('transactionRequest.values.nonce cannot be empty')
  }

  const tx = new Tx(this.toPojo())
  tx.sign(this.values.from.privateKey.to('buffer'))
  return new Amorph(tx.serialize(), 'buffer')
}

TransactionRequest.prototype.serialize = function serialize() {
  arguguard('transactionRequest.serialize', [], arguments)
  const tx = new Tx(this.toPojo())
  return new Amorph(tx.serialize(), 'buffer')
}

TransactionRequest.prototype.toString = function toString() {
  arguguard('transactionRequest.toString', [], arguments)
  return `[TransactionRequest ${this.toPojo()}]`
}

TransactionRequest.prototype.send = function send() {
  arguguard('transactionRequest.send', [], arguments)
  return this.ultralightbeam.send(this)
}

TransactionRequest.prototype.estimateGas = function estimateGas() {
  arguguard('transactionRequest.estimateGas', [], arguments)
  return this.ultralightbeam.eth.estimateGas(this)
}

module.exports = TransactionRequest
