const Transaction = require('../../Transaction')
const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')
const amorphHex = require('amorph-hex')

module.exports = new Interface('getTransactionByHash', 'eth_getTransactionByHash', {
  inputter: defunction([v.word], v.array, function inputter(transactionHash) {
    return [transactionHash.to(amorphHex.prefixed)]
  }),
  outputter: defunction([v.pojo], v.transaction, function outputter(result) {
    return new Transaction(this, result)
  })
})
