const Block = require('../../Block')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_getBlockByHash',
  inputterValidatorNames: ['Amorph_blockHash', 'boolean'],
  inputter: function(blockHash, areTransactionsObjects) {
    return [blockHash.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, args) {
    return new Block(result, args.length > 1 && args[1])
  }
})