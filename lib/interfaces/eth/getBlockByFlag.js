const Block = require('../../Block')
const Interface = require('../../Interface')

module.exports = new Interface('getBlockByFlag', 'eth_getBlockByNumber', {
  inputterValidators: [
    require('../../validators/blockFlag'),
    require('../../validators/boolean')
  ],
  inputter: function inputter(blockFlag, areTransactionsObjects) {
    return [blockFlag.toParam(), areTransactionsObjects]
  },
  outputter: function outputter(result, inputs) {
    return new Block(result, inputs[1])
  }
})
