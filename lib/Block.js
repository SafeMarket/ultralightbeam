const Amorph = require('../modules/Amorph')
const Transaction = require('./Transaction')

function Block(result, areTransactionsObjects) {

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
    'timestamp',
  ]
  prefixedHexKeys.forEach((key) => {
    this[key] = result[key] ? new Amorph(result[key], 'hex.prefixed') : null
  })

  this.uncleHashes = result.uncles.map((uncleHexPrefixed) => {
    return new Amorph(uncleHexPrefixed, 'hex.prefixed')
  })

  if (areTransactionsObjects) {
    this.transactions = result.transactions.map((transactionObject) => {
      return new Transaction(transactionObject)
    })
  } else {
    this.transactionHashes = result.transactions.map((transactionHashHexPrefixed) => {
      return new Amorph(transactionHashHexPrefixed, 'hex.prefixed')
    })
  }

}

module.exports = Block