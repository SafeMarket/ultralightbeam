const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_sendTransaction',
  inputter: function(_transactionRequest) {
    const transactionRequest = _transactionRequest.toPojo()
    if (!transactionRequest.from && this.defaults.from) {
      transactionRequest.from = this.defaults.from.to('hex.prefixed')
    }
    if (!transactionRequest.gas && this.defaults.gas) {
      transactionRequest.gas = this.defaults.gas.to('hex.prefixed')
    }
    return [transactionRequest]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}