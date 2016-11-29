const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_sendTransaction',
  inputter: function(transactionRequest) {
    return [transactionRequest.toPojo(this.defaults)]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}