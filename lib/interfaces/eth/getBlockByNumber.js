const Block = require('../../Block')
const Interface = require('../../Interface')

module.exports = new Interface('getBlockByNumber', 'eth_getBlockByNumber', {
  inputterValidators: [
    require('../../validators/amorph'),
    require('../../validators/boolean')
  ],
  inputter: function inputter(blockNumber, areTransactionsObjects) {
    return [blockNumber.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, inputs) {
    return new Block(result, inputs.length > 1 && inputs[1])
  }
})
