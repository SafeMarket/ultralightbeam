const Transaction = require('./Transaction')
const defunction = require('defunction')
const v = require('./validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = defunction([v.ultralightbeam, v.pojo, v.boolean], v.undefined, function Block(ultralightbeam, result, areTransactionsObjects) {
  this.raw = result
  const prefixedHexKeys = [
    'number',
    'hash',
    'parentHash',
    'nonce',
    'gasUsed',
    'sha3Uncles',
    'logsBloom',
    'transactionsRoot',
    'stateRoot',
    'receiptRoot',
    'miner',
    'difficulty',
    'extraData',
    'size',
    'gasLimit',
    'gasUsed',
    'timestamp'
  ]
  prefixedHexKeys.forEach((key) => {
    this[key] = result[key] ? Amorph.from(amorphHex.prefixed, result[key]) : null
  })

  this.uncleHashes = result.uncles.map((uncleHexPrefixed) => {
    return Amorph.from(amorphHex.prefixed, uncleHexPrefixed)
  })

  if (areTransactionsObjects) {
    this.transactions = result.transactions.map((transactionObject) => {
      return new Transaction(ultralightbeam, transactionObject)
    })
  } else {
    this.transactionHashes =
      result.transactions.map((transactionHashHexPrefixed) => {
        return Amorph.from(amorphHex.prefixed, transactionHashHexPrefixed)
      })
  }
})
