const Block = require('../../Block')

module.exports = {
  method: 'eth_getBlockByHash',
  inputValidators: ['Amorph blockHash', 'boolean'],
  inputter: function(blockHash, areTransactionsObjects) {
    return [blockHash.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, args) {
    return new Block(result, args.length > 1 && args[1])
  }
}