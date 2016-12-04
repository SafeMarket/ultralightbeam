const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_sendTransaction',
  inputValidators: ['TransactionRequest'],
  inputter: function(transactionRequest) {
    return [transactionRequest.toParam(this.defaults)]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}