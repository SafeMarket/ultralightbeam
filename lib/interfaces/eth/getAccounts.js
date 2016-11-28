const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'eth_accounts',
  outputter: function outputter(result) {
    return result.map((account) => {
      return new Amorph(account, 'hex.prefixed')
    })
  }
}