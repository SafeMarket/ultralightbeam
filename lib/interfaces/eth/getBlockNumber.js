const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('getBlockNumber', 'eth_blockNumber', {
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
