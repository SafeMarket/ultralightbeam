const Transaction = require('./Transaction')
const arguguard = require('arguguard')

function Block(ultralightbeam, result, areTransactionsObjects) {
  arguguard('Block', ['Ultralightbeam', 'Object', 'boolean'], arguments)

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
    this[key] = result[key] ? new ultralightbeam.Amorph(result[key], 'hex.prefixed') : null
  })

  this.uncleHashes = result.uncles.map((uncleHexPrefixed) => {
    return new ultralightbeam.Amorph(uncleHexPrefixed, 'hex.prefixed')
  })

  if (areTransactionsObjects) {
    this.transactions = result.transactions.map((transactionObject) => {
      return new Transaction(ultralightbeam, transactionObject)
    })
  } else {
    this.transactionHashes =
      result.transactions.map((transactionHashHexPrefixed) => {
        return new ultralightbeam.Amorph(transactionHashHexPrefixed, 'hex.prefixed')
      })
  }

}

module.exports = Block
