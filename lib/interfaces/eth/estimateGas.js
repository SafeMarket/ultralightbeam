const Interface = require('../../Interface')

module.exports = new Interface('estimateGas', 'eth_estimateGas', ['TransactionRequest'], {
  inputter: function inputter(transactionRequest) {
    return [transactionRequest.toPojo()]
  },
  outputter: function outputter(result) {
    return new this.Amorph(result, 'hex.prefixed')
  }
})
