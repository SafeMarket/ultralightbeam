const TransactionReceipt = require('../../TransactionReceipt')
const Interface = require('../../Interface')

module.exports = new Interface(
  'getTransactionReceipt',
  'eth_getTransactionReceipt',
  {
    inputterValidators: [
      require('../../validators/amorphTransactionHash')
    ],
    inputter: function inputter(transactionHash) {
      return [transactionHash.to('hex.prefixed')]
    },
    outputter: function outputter(result) {
      if (result === null) {
        return null
      }
      return new TransactionReceipt(result)
    }
  }
)
