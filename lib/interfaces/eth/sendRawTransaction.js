const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('sendRawTransaction', 'eth_sendRawTransaction', {
  inputterValidators: [
    require('../../validators/amorph')
  ],
  inputter: function inputter(rawTransaction) {
    return [rawTransaction.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  },
  doesPollForTransactionReceipt: true
})
