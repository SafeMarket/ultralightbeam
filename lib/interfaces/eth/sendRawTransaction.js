const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_sendRawTransaction',
  inputter: function(data) {
    return [data.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}