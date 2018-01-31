const TransactionReceipt = require('../../TransactionReceipt')
const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')
const amorphHex = require('amorph-hex')

module.exports = new Interface('getTransactionReceipt', 'eth_getTransactionReceipt', {
  inputter: defunction([v.word], v.array, function inputter(transactionHash) {
    return [transactionHash.to(amorphHex.prefixed)]
  }),
  outputter: defunction([v.pojo], v.transactionReceipt, function outputter(result) {
    return new TransactionReceipt(this, result)
  })
})
