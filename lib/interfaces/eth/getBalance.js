const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const addressValidator = require('../../validators/address')

module.exports = new Interface('getBalance', 'eth_getBalance', [addressValidator], {
  inputter: function inputter(address) {
    return [address.to('hex.prefixed'), blockFlags.latest.toParam()]
  },
  outputter: function outputter(result) {
    return new this.Amorph(result, 'hex.prefixed')
  }
})
