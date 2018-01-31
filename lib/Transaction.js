const defunction = require('defunction')
const v = require('./validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = defunction([v.ultralightbeam, v.pojo], v.undefined, function Transaction(ultralightbeam, result) {

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
    this[key] = result[key] ? Amorph.from(amorphHex.prefixed, result[key]) : null
  })

})
