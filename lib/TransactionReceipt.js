const Amorph = require('./Amorph')

function TransactionReceipt(result) {

  this.raw = result

  const prefixedHexKeys = [
    'transactionHash',
    'transactionIndex',
    'blockHash',
    'blockNumber',
    'gasUsed',
    'cumulativeGasUsed',
    'contractAddress'
  ]
  prefixedHexKeys.forEach((key) => {
    this[key] = result[key] ? new Amorph(result[key], 'hex.prefixed') : null
  })

}

module.exports = TransactionReceipt
