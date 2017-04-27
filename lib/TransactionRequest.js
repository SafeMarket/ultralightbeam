const _ = require('lodash')
const Amorph = require('./Amorph')
const transactionRequestFields = require('./transactionRequestFields')
const transactionRequestFieldValidator = require('./validators/transactionRequestField')
const arguguard = require('arguguard')
const MissingFromError = require('./errors/MissingFrom')
const MissingNonceError = require('./errors/MissingNonce')
const signer = require('ethjs-signer')

function TransactionRequest(ultralightbeam, values) {
  arguguard('TransactionRequest', ['Ultralightbeam', 'Object'], arguments)
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
    throw new MissingFromError('transactionRequest.values.from cannot be empty')
  }
  if (!this.values.nonce) {
    throw new MissingNonceError('transactionRequest.values.nonce cannot be empty')
  }
  const rawSignedHexPrefixed = signer.sign(this.toPojo(), this.values.from.privateKey.to('hex.prefixed'))
  return new Amorph(rawSignedHexPrefixed, 'hex.prefixed')
}

TransactionRequest.prototype.toString = function toString() {
  arguguard('transactionRequest.toString', [], arguments)
  return `['TransactionRequest' ${this.toPojo()}]`
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
