const Block = require('../../Block')
const Interface = require('../../Interface')
const BlockFlag = require('../../BlockFlag')

module.exports = new Interface('getBlockByFlag', 'eth_getBlockByNumber', [BlockFlag, 'boolean'], {
  inputter: function inputter(blockFlag, areTransactionsObjects) {
    return [blockFlag.toParam(), areTransactionsObjects]
  },
  outputter: function outputter(result, inputs) {
    return new Block(result, inputs[1])
  }
})
