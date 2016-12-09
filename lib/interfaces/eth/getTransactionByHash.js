const Transaction = require('../../Transaction')
const Interface = require('../../Interface')

module.exports = new Interface(
  'getTransactionByHash',
  'eth_getTransactionByHash',
  {
    inputterValidators: [
      require('../../validators/amorphTransactionHash')
    ],
    inputter: function inputter(transactionHash) {
      return [transactionHash.to('hex.prefixed')]
    },
    outputter: function outputter(result) {
      return new Transaction(result)
    }
  }
)
