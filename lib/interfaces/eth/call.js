const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_call',
  inputter: function(_transactionRequest) {
    return [transactionRequest.toPojo(this.defaults), blockFlags.latest]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}