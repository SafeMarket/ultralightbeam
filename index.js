const Q = require('q')
const bulk = require('bulk-require')
const interfaces = bulk(__dirname + '/lib/interfaces/', '**/*.js')
const Batch = require('./lib/Batch')
const Protocol = require('./lib/Protocol')
const debouncedExecute = require('./lib/debouncedExecute')
const BlockPoller = require('./lib/BlockPoller')
const Emitter = require('events')
const _ = require('lodash')
const blockFlags = require('./lib/blockFlags')

function Ultralightbeam(provider, defaults) {

  this.defaults =  {
    blockPollerInterval: 1000,
    maxBlocksToWait: 3
  }
  _.merge(this.defaults, defaults || {})

  this.id = 0
  this.provider = provider
  this.batch = new Batch(this)
  this.batches = []
  this.web3 = new Protocol(this, interfaces.web3)
  this.net = new Protocol(this, interfaces.net)
  this.eth = new Protocol(this, interfaces.eth)
  this.miner = new Protocol(this, interfaces.miner)
  this.blockPoller = new BlockPoller(this)

  this.blockPoller.start(this.defaults.blockPollerInterval)
  this.emitter = new Emitter
}

Ultralightbeam.prototype.execute = function execute() {
  return debouncedExecute(this)
}

Ultralightbeam.prototype.defer = function defer() {
  return Q.defer()
}

Ultralightbeam.prototype.reject = function reject(reason) {
  return Q.reject(reason)
}

Ultralightbeam.prototype.resolve = function resolve(reason) {
  return Q.resolve(reason)
}

Ultralightbeam.prototype.sendTransaction = function sendTransaction(transactionRequest) {
  return this.eth.estimateGas(transactionRequest, blockFlags.latest).then((gas) => {
    const rawTransactionRequest = transactionRequest
      .gas(gas, blockFlags.latest)
      .defaults(this.defaults)
      .toRawSigned()
    return this.eth.sendRawTransaction(rawTransactionRequest)
  })
}

module.exports = Ultralightbeam
