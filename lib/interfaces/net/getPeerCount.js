const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'net_peerCount',
  outputter: function (result) {
    return new Amorph(result, 'hex.prefixed').to('number')
  }
})