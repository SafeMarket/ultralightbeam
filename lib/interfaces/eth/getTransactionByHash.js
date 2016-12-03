const Transaction = require('../../Transaction')

module.exports = {
  method: 'eth_getTransactionByHash',
  inputter: function(transactionHash) {
    return [transactionHash.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Transaction(result)
  }
}