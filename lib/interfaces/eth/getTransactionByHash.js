const Transaction = require('../../Transaction')
const Interface = require('../../Interface')
const wordValidator = require('../../validators/word')

module.exports = new Interface('getTransactionByHash', 'eth_getTransactionByHash', [wordValidator], {
  inputter: function inputter(transactionHash) {
    return [transactionHash.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Transaction(this, result)
  }
})
