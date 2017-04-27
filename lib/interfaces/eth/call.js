const Amorph = require('../../Amorph')
const Interface = require('../../Interface')
const blockFlags = require('../..//blockFlags')
const TransactionRequest = require('../../TransactionRequest')

module.exports = new Interface('call', 'eth_call', ['TransactionRequest'], {
  inputter: function inputter(transactionRequest) {
    return [transactionRequest.toPojo(), blockFlags.latest.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
