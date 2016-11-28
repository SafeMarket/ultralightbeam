const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_getCode',
  inputter: function(address) {
    return [address.to('hex.prefixed'), 'latest']
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}