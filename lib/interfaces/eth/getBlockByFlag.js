const Block = require('../../Block')
const Interface = require('../../Interface')

module.exports = new Interface('getBlockByFlag', 'eth_getBlockByNumber', ['BlockFlag', 'boolean'], {
  inputter: function inputter(blockFlag, areTransactionsObjects) {
    return [blockFlag.toParam(), areTransactionsObjects]
  },
  outputter: function outputter(result, inputs) {
    return new Block(this, result, inputs[1])
  }
})
