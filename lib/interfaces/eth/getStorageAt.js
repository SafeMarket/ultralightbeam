const Amorph = require('../../Amorph')
const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')

module.exports = new Interface('getStorageAt', 'eth_getStorageAt', {
  inputterValidators: [
    require('../../validators/amorphAddress'),
    require('../../validators/amorph')
  ],
  inputter: function inputter(address, key) {
    return [
      address.to('hex.prefixed'), key.to('hex.prefixed'), blockFlags.latest.toParam()
    ]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
