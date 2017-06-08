const TransactionReceipt = require('../../TransactionReceipt')
const Interface = require('../../Interface')
const wordValidator = require('../../validators/word')

module.exports = new Interface('getTransactionReceipt', 'eth_getTransactionReceipt', [wordValidator], {
  inputter: function inputter(transactionHash) {
    return [transactionHash.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    if (result === null) {
      return null
    }
    return new TransactionReceipt(this, result)
  }
})
