const TransactionReceipt = require('../../TransactionReceipt')

module.exports = {
  method: 'eth_getTransactionReceipt',
  inputter: function(transactionHash) {
    return [transactionHash.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    if (result === null) {
      return null;
    }
    return new TransactionReceipt(result)
  }
}