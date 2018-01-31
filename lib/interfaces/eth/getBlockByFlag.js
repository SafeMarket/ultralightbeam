const Block = require('../../Block')
const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')

module.exports = new Interface('getBlockByFlag', 'eth_getBlockByNumber', {
  inputter: defunction([v.blockFlag, v.boolean], v.array, function inputter(blockFlag, areTransactionsObjects) {
    return [blockFlag.toParam(), areTransactionsObjects]
  }),
  outputter: defunction([v.pojo], v.block, function outputter(result) {
    return new Block(this, result, result.transactions.length > 0 && typeof result.transactions[0] === 'object')
  })
})
