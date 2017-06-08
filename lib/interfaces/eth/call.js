const Interface = require('../../Interface')
const blockFlags = require('../..//blockFlags')

module.exports = new Interface('call', 'eth_call', ['TransactionRequest'], {
  inputter: function inputter(transactionRequest) {
    return [transactionRequest.toPojo(), blockFlags.latest.toParam()]
  },
  outputter: function outputter(result) {
    return new this.Amorph(result, 'hex.prefixed')
  }
})
