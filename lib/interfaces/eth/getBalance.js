const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_getBalance',
  inputter: function(account) {
    return [account.to('hex.prefixed'), 'latest']
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}