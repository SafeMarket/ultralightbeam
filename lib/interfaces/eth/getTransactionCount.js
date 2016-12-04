const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_getTransactionCount',
  inputValidators: ['Amorph address', 'BlockFlag'],
  inputter: function(address, blockFlag) {
    return [address.to('hex.prefixed'), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}