const Block = require('../../Block')
const Interface = require('../../Interface')

module.exports = new Interface('getBlockByNumber', 'eth_getBlockByNumber', ['Amorph', 'boolean'], {
  inputter: function inputter(blockNumber, areTransactionsObjects) {
    return [blockNumber.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, inputs) {
    return new Block(this, result, inputs[1])
  }
})
