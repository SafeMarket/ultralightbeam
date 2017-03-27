const Amorph = require('../../Amorph')
const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const addressValidator = require('../../validators/address')

module.exports = new Interface('getTransactionCount', 'eth_getTransactionCount', [addressValidator], {
  inputter: function inputter(address) {
    return [address.to('hex.prefixed'), blockFlags.latest.toParam()]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
})
