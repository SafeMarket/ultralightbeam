const _ = require('lodash')
const defunction = require('defunction')
const v = require('./validates')
const MissingFromError = require('./errors/MissingFrom')
const MissingNonceError = require('./errors/MissingNonce')
const signer = require('ethjs-signer')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')
const amorphNumber = require('amorph-number')

const TransactionRequest = module.exports = defunction([v.ultralightbeam, v.pojo], v.undefined, function TransactionRequest(ultralightbeam, values) {
  this.ultralightbeam = ultralightbeam
  this.values = values || {}
  _.forEach(this.values, (value, key) => {
    this.set(key, value)
  })
  if (!this.values.from && ultralightbeam && ultralightbeam.options.defaultAccount) {
    this.set('from', ultralightbeam.options.defaultAccount)
  }
})

TransactionRequest.prototype.set = defunction([v.transactionRequestField, v.anything], v.undefined, function set(key, value) {
  v.transactionRequestFields[key](`TransactionRequest.prototype.set:arguments[1](${key})`, value)
  this.values[key] = value
})

TransactionRequest.prototype.toPojo = defunction([], v.pojo, function toPojo() {
  const pojo = {}
  _.forEach(this.values, (value, key) => {
    switch (key) {
    case 'from':
      pojo[key] = value.address.to(amorphHex.prefixed)
      break
    case 'nonce':
      pojo[key] = value.to(amorphNumber.unsigned)
      break
    default:
      pojo[key] = value.to(amorphHex.prefixed)
    }
  })
  return pojo
})

TransactionRequest.prototype.toRawSigned = defunction([], v.amorph, function toRawSigned() {
  if (!this.values.from) {
    throw new MissingFromError('transactionRequest.values.from cannot be empty')
  }
  if (!this.values.nonce) {
    throw new MissingNonceError('transactionRequest.values.nonce cannot be empty')
  }
  const rawSignedHexPrefixed = signer.sign(this.toPojo(), this.values.from.privateKey.to(amorphHex.prefixed))
  return Amorph.from(amorphHex.prefixed, rawSignedHexPrefixed)
})

TransactionRequest.prototype.toString = defunction([], v.string, function toString() {
  return `['TransactionRequest' ${this.toPojo()}]`
})

TransactionRequest.prototype.send = defunction([], v.transactionMonitor, function send() {
  return this.ultralightbeam.send(this)
})

TransactionRequest.prototype.estimateGas = defunction([], v.amorph, function estimateGas() {
  return this.ultralightbeam.eth.estimateGas(this)
})
