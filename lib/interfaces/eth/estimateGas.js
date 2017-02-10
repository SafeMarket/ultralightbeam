const Amorph = require('../../Amorph')
const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')

module.exports = new Interface('estimateGas', 'eth_estimateGas', {
  inputterValidators: [
    require('../../validators/transactionRequest')
  ],
  inputter: function inputter(transactionRequest) {
    return [transactionRequest.toPojo()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
