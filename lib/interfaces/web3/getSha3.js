const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('sha3', 'web3_sha3', [Amorph], {
  inputter: function inputter(data) {
    return [data.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
