const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_sign',
  inputterValidatorNames: ['Amorph_address', 'Amorph'],
  inputter: function(address, data) {
    return [address.to('hex.prefixed'), data.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})