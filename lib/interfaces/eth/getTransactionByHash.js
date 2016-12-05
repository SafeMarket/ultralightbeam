const Transaction = require('../../Transaction')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_getTransactionByHash',
  inputterValidatorNames: ['Amorph_transactionHash'],
  inputter: function(transactionHash) {
    return [transactionHash.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Transaction(result)
  }
})