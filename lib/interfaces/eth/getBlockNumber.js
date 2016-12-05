const Amorph = require('../../../modules/Amorph')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_blockNumber',
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})