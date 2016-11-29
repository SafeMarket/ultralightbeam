const Block = require('../../Block')

module.exports = {
  method: 'eth_getBlockByNumber',
  inputter: function(blockNumber, _areTransactionsObjects) {
    const areTransactionsObjects = _areTransactionsObjects || false
    return [blockNumber.to('hex.prefixed'), _areTransactionsObjects]
  },
  outputter: function outputter(result, args) {
    return new Block(result, args.length > 1 && args[1])
  }
}