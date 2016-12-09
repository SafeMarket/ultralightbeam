const Block = require('../../Block')
const Interface = require('../../Interface')

module.exports = new Interface('getBlockByHash', 'eth_getBlockByHash', {
  inputterValidators: [
    require('../../validators/amorphBlockHash'),
    require('../../validators/boolean')
  ],
  inputter: function inputter(blockHash, areTransactionsObjects) {
    return [blockHash.to('hex.prefixed'), areTransactionsObjects]
  },
  outputter: function outputter(result, inputs) {
    return new Block(result, inputs.length > 1 && inputs[1])
  }
})
