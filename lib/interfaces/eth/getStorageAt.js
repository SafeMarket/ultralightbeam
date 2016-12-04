const Amorph = require('../../../modules/Amorph')
const blockFlags = require('../../blockFlags')

module.exports = {
  method: 'eth_getStorageAt',
  inputValidators: ['Amorph address', 'Amorph key', 'BlockFlag'],
  inputter: function(address, key, blockFlag) {
    return [address.to('hex.prefixed'), key.to('hex.prefixed'), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}