const _ = require('lodash')

function TransactionRequest(data) {
  _.merge(this, data)
}

TransactionRequest.prototype.toPojo = function toPojo (defaults) {
  const pojo = {}
  _.map(this, (value, key) => {
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

module.exports = TransactionRequest