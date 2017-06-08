const Interface = require('../../Interface')

module.exports = new Interface('sendRawTransaction', 'eth_sendRawTransaction', ['Amorph'], {
  inputter: function inputter(signedRawTransaction) {
    return [signedRawTransaction.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new this.Amorph(result, 'hex.prefixed')
  }
})
