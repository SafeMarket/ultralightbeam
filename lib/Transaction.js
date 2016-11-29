const Amorph = require('../modules/Amorph')

function Transaction(result) {

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
    this[key] = result[key] ? new Amorph(result[key], 'hex.prefixed') : null
  })

}

module.exports = Transaction