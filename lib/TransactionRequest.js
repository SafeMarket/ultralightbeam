const _ = require('lodash')

function TransactionRequest(data) {
  _.merge(this, data)
}

TransactionRequest.prototype.toPojo = function toPojo () {
  const pojo = {}
  _.map(this, (value, key) => {
    return pojo[key] = value.to('hex.prefixed')
  })
  return pojo
}

module.exports = TransactionRequest