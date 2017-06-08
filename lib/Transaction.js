const arguguard = require('arguguard')

function Transaction(ultralightbeam, result) {
  arguguard('Transaction', ['Ultralightbeam', 'Object'], arguments)

  this.ultralightbeam = ultralightbeam
  this.raw = result

  const prefixedHexKeys = [
    'hash',
    'nonce',
    'blockHash',
    'blockNumber',
    'transactionIndex',
    'from',
    'to',
    'value',
    'gasPrice',
    'gas',
    'input'
  ]

  prefixedHexKeys.forEach((key) => {
    this[key] = result[key] ? new ultralightbeam.Amorph(result[key], 'hex.prefixed') : null
  })

}

module.exports = Transaction
