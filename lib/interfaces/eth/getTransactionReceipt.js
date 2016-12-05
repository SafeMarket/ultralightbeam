const TransactionReceipt = require('../../TransactionReceipt')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_getTransactionReceipt',
  inputterValidatorNames: ['Amorph_transactionHash'],
  inputter: function(transactionHash) {
    return [transactionHash.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    if (result === null) {
      return null;
    }
    return new TransactionReceipt(result)
  }
})