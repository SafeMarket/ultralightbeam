const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'web3_sha3',
  inputValidators: ['Amorph'],
  inputter: function(data) {
    return [data.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}