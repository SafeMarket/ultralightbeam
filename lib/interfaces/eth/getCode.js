const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const addressValidator = require('../../validators/address')

module.exports = new Interface('getCode', 'eth_getCode', [addressValidator], {
  inputter: function inputter(address) {
    return [address.to('hex.prefixed'), blockFlags.latest.toParam()]
  },
  outputter: function outputter(_result) {
    // TODO: resolve https://github.com/trufflesuite/ganache-core/issues/51
    const result = (_result === '0x0') ? '0x' : _result
    return new this.Amorph(result, 'hex.prefixed')
  }
})
