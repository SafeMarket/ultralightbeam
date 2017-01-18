const Amorph = require('../../Amorph')
const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')

module.exports = new Interface(
  'getTransactionCount',
  'eth_getTransactionCount',
  {
    inputterValidators: [
      require('../../validators/amorphAddress')
    ],
    inputter: function inputter(address) {
      return [address.to('hex.prefixed'), blockFlags.latest.toParam()]
    },
    outputter: function outputter(result) {
      return new Amorph(result, 'hex.prefixed')
    }
  }
)
