const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('sendTransaction', 'eth_sendTransaction', {
  inputterValidators: [
    require('../../validators/transactionRequest')
  ],
  inputter: function inputter(transactionRequest) {
    return [transactionRequest.toParam(this.defaults)]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
