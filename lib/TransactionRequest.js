const _ = require('lodash')
const keys = ['from', 'to', 'value', 'gas', 'gasPrice']
const Tx = require('ethereumjs-tx')
const Amorph = require('../modules/Amorph')

function TransactionRequest(values) {
  this.values = {}
  _.merge(this.values, values || {})
}

keys.forEach((key) => {
  TransactionRequest.prototype[key] = function(value) {
    this.values[key] = value
    return this
  }
})

TransactionRequest.prototype.toPojo = function toPojo (_defaults) {

  const pojo = {}
  const defaults = _defaults || {}

  _.map(this.values, (value, key) => {
    return pojo[key] = value.to('hex.prefixed')
  })

  if (!pojo.from && defaults.from) {
    pojo.from = defaults.from.to('hex.prefixed')
  }
  if (!pojo.gas && defaults.gas) {
    pojo.gas = defaults.gas.to('hex.prefixed')
  }

  return pojo
}

TransactionRequest.prototype.sign = function sign (privateKey) {
  const tx = new Tx(this.toPojo())
  tx.sign(privateKey.to('buffer'))
  return new Amorph(tx.serialize(), 'buffer')
}

TransactionRequest.prototype.serialize = function() {
  const tx = new Tx(this.toPojo())
  return new Amorph(tx.serialize(), 'buffer')
}

module.exports = TransactionRequest