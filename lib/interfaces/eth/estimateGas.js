const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')
const Interface = require('../../Interface')


module.exports = new Interface({
  method: 'eth_estimateGas',
  inputterValidatorNames: ['TransactionRequest', 'BlockFlag'],
  inputter: function(transactionRequest, blockFlag) {
    return [transactionRequest.toParam(this.defaults), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})