const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('getBalance', 'eth_getBalance', {
  inputterValidators: [
    require('../../validators/amorphAddress'),
    require('../../validators/blockFlag')
  ],
  inputter: function inputter(address, blockFlag) {
    return [address.to('hex.prefixed'), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
