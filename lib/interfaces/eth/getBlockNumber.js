const Interface = require('../../Interface')

module.exports = new Interface('getBlockNumber', 'eth_blockNumber', [], {
  outputter: function outputter(result) {
    return new this.Amorph(result, 'hex.prefixed')
  }
})
