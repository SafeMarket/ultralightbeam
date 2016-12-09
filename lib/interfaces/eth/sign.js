const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('sign', 'eth_sign', {
  inputterValidators: [
    require('../../validators/amorphAddress'),
    require('../../validators/amorph')
  ],
  inputter: function inputter(address, data) {
    return [address.to('hex.prefixed'), data.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
