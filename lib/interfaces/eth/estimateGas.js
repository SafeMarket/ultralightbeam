const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_estimateGas',
  inputValidators: ['TransactionRequest', 'BlockFlag'],
  inputter: function(transactionRequest, blockFlag) {
    return [transactionRequest.toParam(this.defaults), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}