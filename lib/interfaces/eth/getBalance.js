const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_getBalance',
  inputter: function(address) {
    return [address.to('hex.prefixed'), blockFlags.latest]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}