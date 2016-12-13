const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

require('../../validators/transactionRequest')

module.exports = new Interface('call', 'eth_call', {
  inputterValidators: [
    require('../../validators/transactionRequest'),
    require('../../validators/blockFlag')
  ],
  inputter: function inputter(transactionRequest, blockFlag) {
    return [transactionRequest.defaults(this.defaults).toPojo(), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
