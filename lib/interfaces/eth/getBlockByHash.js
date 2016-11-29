const Block = require('../../Block')

module.exports = {
  method: 'eth_getBlockByHash',
  inputter: function(blockHash, _areTransactionsObjects) {
    const areTransactionsObjects = _areTransactionsObjects || false
    return [blockHash.to('hex.prefixed'), _areTransactionsObjects]
  },
  outputter: function outputter(result, args) {
    return new Block(result, args.length > 1 && args[1])
  }
}