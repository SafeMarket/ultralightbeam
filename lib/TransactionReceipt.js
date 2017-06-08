const arguguard = require('arguguard')

const transactionReceiptPrefixedHexKeys = [
  'transactionHash',
  'transactionIndex',
  'blockHash',
  'blockNumber',
  'gasUsed',
  'cumulativeGasUsed',
  'contractAddress'
]

const logPrefixedHexKeys = [
  'logIndex',
  'transactionIndex',
  'transactionHash',
  'blockHash',
  'blockNumber',
  'address',
  'data'
]

function Log(ultralightbeam, raw) {
  arguguard('Log', ['Ultralightbeam', 'Object'], arguments)
  this.raw = raw
  this.removed = raw.removed ? true : false
  logPrefixedHexKeys.forEach((key) => {
    this[key] = raw[key] ? new ultralightbeam.Amorph(raw[key], 'hex.prefixed') : null
  })
  this.topics = raw.topics.map((topicHexPrefixed) => {
    return new ultralightbeam.Amorph(topicHexPrefixed, 'hex.prefixed')
  })
}

function TransactionReceipt(ultralightbeam, raw) {
  arguguard('TransactionReceipt', ['Ultralightbeam', 'Object'], arguments)
  this.raw = raw
  this.logs = []

  transactionReceiptPrefixedHexKeys.forEach((key) => {
    this[key] = raw[key] ? new ultralightbeam.Amorph(raw[key], 'hex.prefixed') : null
  })

  raw.logs.forEach((rawLog) => {
    this.logs.push(new Log(ultralightbeam, rawLog))
  })
}

module.exports = TransactionReceipt
