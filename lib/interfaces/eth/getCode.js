const Amorph = require('../../Amorph')
const blockFlags = require('../../blockFlags')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_getCode',
  inputterValidatorNames: ['Amorph_address', 'BlockFlag'],
  inputter: function(address, blockFlag) {
    return [address.to('hex.prefixed'), blockFlag.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})