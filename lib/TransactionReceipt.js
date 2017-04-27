const Amorph = require('./Amorph')
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

function Log(raw) {
  arguguard('Log', ['Object'], arguments)
  this.raw = raw
  this.removed = raw.removed ? true : false
  logPrefixedHexKeys.forEach((key) => {
    this[key] = raw[key] ? new Amorph(raw[key], 'hex.prefixed') : null
  })
  this.topics = raw.topics.map((topicHexPrefixed) => {
    return new Amorph(topicHexPrefixed, 'hex.prefixed')
  })
}

function TransactionReceipt(raw) {
  arguguard('TransactionReceipt', ['Object'], arguments)
  this.raw = raw
  this.logs = []

  transactionReceiptPrefixedHexKeys.forEach((key) => {
    this[key] = raw[key] ? new Amorph(raw[key], 'hex.prefixed') : null
  })

  raw.logs.forEach((rawLog) => {
    this.logs.push(new Log(rawLog))
  })
}

module.exports = TransactionReceipt
