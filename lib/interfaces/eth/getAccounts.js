const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_accounts',
  outputter: function outputter(result) {
    return result.map((account) => {
      return new Amorph(account, 'hex.prefixed')
    })
  }
})