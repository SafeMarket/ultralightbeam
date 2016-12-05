const Amorph = require('../../../modules/Amorph')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_sendTransaction',
  inputterValidatorNames: ['TransactionRequest'],
  inputter: function(transactionRequest) {
    return [transactionRequest.toParam(this.defaults)]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})