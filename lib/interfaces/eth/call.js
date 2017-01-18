const Amorph = require('../../Amorph')
const Interface = require('../../Interface')
const blockFlags = require('../..//blockFlags')

require('../../validators/transactionRequest')

module.exports = new Interface('call', 'eth_call', {
  inputterValidators: [
    require('../../validators/transactionRequest')
  ],
  inputter: function inputter(transactionRequest) {
    return [transactionRequest.toPojo(), blockFlags.latest.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
