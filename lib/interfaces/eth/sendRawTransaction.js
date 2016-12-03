const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_sendRawTransaction',
  inputter: function(rawTransaction) {
    return [rawTransaction.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}