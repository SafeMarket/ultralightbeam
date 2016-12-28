const Interface = require('../../Interface')
const Amorph = require('../../Amorph')

module.exports = new Interface('getGasPrice', 'eth_gasPrice', {
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
