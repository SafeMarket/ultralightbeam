const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('estimateGas', 'eth_estimateGas', {
  inputterValidators: [
    require('../../validators/transactionRequest'),
    require('../../validators/blockFlag')
  ],
  inputter: function inputter(transactionRequest, blockFlag) {
    return [transactionRequest.toPojo(), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
