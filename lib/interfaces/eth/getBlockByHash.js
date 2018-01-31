const Block = require('../../Block')
const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')
const amorphHex = require('amorph-hex')

module.exports = new Interface('getBlockByHash', 'eth_getBlockByHash', {
  inputter: defunction([v.word, v.boolean], v.array, function inputter(blockHash, areTransactionsObjects) {
    return [blockHash.to(amorphHex.prefixed), areTransactionsObjects]
  }),
  outputter: defunction([v.pojo], v.block, function outputter(result) {
    return new Block(this, result, result.transactions.length > 0 && typeof result.transactions[0] === 'object')
  })
})
