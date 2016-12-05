const Amorph = require('../../../modules/Amorph')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'web3_sha3',
  inputterValidatorNames: ['Amorph'],
  inputter: function(data) {
    return [data.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})