const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'web3_sha3',
  inputter: function(account) {
    return [account.to('hex.prefixed')]
  },
  outputter: function outputter(result) {
    return new Amorph(result, 'hex.prefixed')
  }
}