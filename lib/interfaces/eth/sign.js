const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_sign',
  inputValidators: ['Amorph address', 'Amorph'],
  inputter: function(address, data) {
    return [address.to('hex.prefixed'), data.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}