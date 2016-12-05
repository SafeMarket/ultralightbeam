const Amorph = require('../../Amorph')
const blockFlags = require('../../blockFlags')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_getStorageAt',
  inputterValidatorNames: ['Amorph_address', 'Amorph', 'BlockFlag'],
  inputter: function(address, key, blockFlag) {
    return [address.to('hex.prefixed'), key.to('hex.prefixed'), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})