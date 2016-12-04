const Block = require('../../Block')

module.exports = {
  method: 'eth_getBlockByNumber',
  inputValidators: ['Amorph', 'boolean'],
  inputter: function(blockNumber, areTransactionsObjects) {
    return [blockNumber.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, args) {
    return new Block(result, args.length > 1 && args[1])
  }
}