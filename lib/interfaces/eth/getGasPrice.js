const Interface = require('../../Interface')

module.exports = new Interface('getGasPrice', 'eth_gasPrice', [], {
  outputter: function outputter(result) {
    return new this.Amorph(result, 'hex.prefixed')
  }
})
