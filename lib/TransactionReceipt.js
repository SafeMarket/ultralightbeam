const Amorph = require('./Amorph')

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
