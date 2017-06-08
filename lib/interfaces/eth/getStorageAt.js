const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const addressValidator = require('../../validators/address')

module.exports = new Interface('getStorageAt', 'eth_getStorageAt', [addressValidator, 'Amorph'], {
  inputter: function inputter(address, key) {
    return [
      address.to('hex.prefixed'), key.to('hex.prefixed'), blockFlags.latest.toParam()
    ]
  },
  outputter: function outputter(result) {
    return new this.Amorph(result, 'hex.prefixed')
  }
})
