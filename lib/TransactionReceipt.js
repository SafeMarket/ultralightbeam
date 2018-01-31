const defunction = require('defunction')
const v = require('./validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

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

const Log = defunction([v.ultralightbeam, v.pojo], v.undefined, function Log(ultralightbeam, raw) {
  this.raw = raw
  this.removed = raw.removed ? true : false
  logPrefixedHexKeys.forEach((key) => {
    this[key] = raw[key] ? Amorph.from(amorphHex.prefixed, raw[key]) : null
  })
  this.topics = raw.topics.map((topicHexPrefixed) => {
    return Amorph.from(amorphHex.prefixed, topicHexPrefixed)
  })
})

module.exports = defunction([v.ultralightbeam, v.pojo], v.undefined, function TransactionReceipt(ultralightbeam, raw) {
  this.raw = raw
  this.logs = []

  transactionReceiptPrefixedHexKeys.forEach((key) => {
    this[key] = raw[key] ? Amorph.from(amorphHex.prefixed, raw[key]) : null
  })

  this.isFailed = raw.status === 0 ? true : false

  raw.logs.forEach((rawLog) => {
    this.logs.push(new Log(ultralightbeam, rawLog))
  })
})
