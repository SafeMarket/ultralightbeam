const Amorph = require('../../Amorph')
const blockFlags = require('../../blockFlags')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_sendRawTransaction',
  inputterValidatorNames: ['Amorph'],
  inputter: function(rawTransaction) {
    return [rawTransaction.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})