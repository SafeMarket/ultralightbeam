const Block = require('../../Block')
const Interface = require('../../Interface')
const Amorph = require('../../Amorph')

module.exports = new Interface('getBlockByHash', 'eth_getBlockByHash', [Amorph, 'boolean'], {
  inputter: function inputter(blockHash, areTransactionsObjects) {
    return [blockHash.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, inputs) {
    return new Block(result, inputs[1])
  }
})
