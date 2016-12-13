const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('estimateGas', 'eth_estimateGas', {
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
