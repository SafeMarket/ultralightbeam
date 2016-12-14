const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('sendTransaction', 'eth_sendRawTransaction', {
  inputterValidators: [
    require('../../validators/transactionRequest')
  ],
  inputter: function inputter(transactionRequest) {
    // eslint-disable-next-line max-len
    return [transactionRequest.defaults(this.defaults).toRawSigned().to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  },
  doesPollForTransactionReceipt: true
})
