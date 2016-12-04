const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_sendRawTransaction',
  inputValidators: ['Amorph'],
  inputter: function(rawTransaction) {
    return [rawTransaction.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}