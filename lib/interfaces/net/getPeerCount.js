const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'net_peerCount',
  outputter: function (result) {
    return new Amorph(result, 'hex.prefixed').to('number')
  }
}