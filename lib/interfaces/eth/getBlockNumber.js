const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_blockNumber',
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}