const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_getStorageAt',
  inputter: function(account, key) {
    return [account.to('hex.prefixed'), key.to('hex.prefixed'), blockFlags.latest]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}