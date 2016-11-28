const _ = require('lodash')
const Amorph = require('../modules/Amorph')

function TransactionReceipt(result) {

  _.merge(this, result)

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
    this[key] = new Amorph(result[key], 'hex.prefixed')
  })

}

module.exports = TransactionReceipt