const Block = require('../../Block')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'eth_getBlockByNumber',
  inputterValidatorNames: ['Amorph', 'boolean'],
  inputter: function(blockNumber, areTransactionsObjects) {
    return [blockNumber.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, args) {
    return new Block(result, args.length > 1 && args[1])
  }
})