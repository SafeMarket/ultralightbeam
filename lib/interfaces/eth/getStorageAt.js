const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('getStorageAt', 'eth_getStorageAt', {
  inputterValidators: [
    require('../../validators/amorphAddress'),
    require('../../validators/amorph'),
    require('../../validators/blockFlag')
  ],
  inputter: function inputter(address, key, blockFlag) {
    return [
      address.to('hex.prefixed'), key.to('hex.prefixed'), blockFlag.toParam()
    ]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
