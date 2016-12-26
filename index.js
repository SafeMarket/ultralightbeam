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

function Ultralightbeam(provider, _options) {

  this.options =  {
    blockPollerInterval: 1000,
    maxBlocksToWait: 3,
    transactionApprover: (transactionRequest, gas) => {
      if (!transactionRequest.values.gas) {
        transactionRequest.set('gas', gas)
      }
      return this.resolve(transactionRequest)
    }
  }
  _.merge(this.options, _options || {})

  this.id = 0
  this.provider = provider
  this.batch = new Batch(this)
  this.batches = []
  this.web3 = new Protocol(this, interfaces.web3)
  this.net = new Protocol(this, interfaces.net)
  this.eth = new Protocol(this, interfaces.eth)
  this.miner = new Protocol(this, interfaces.miner)
  this.blockPoller = new BlockPoller(this)

  this.blockPoller.start(this.options.blockPollerInterval)
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

Ultralightbeam.prototype.sendTransaction = function sendTransaction(
  _transactionRequest, _transactionApprover
) {
  const transactionApprover = _transactionApprover || this.options.transactionApprover
  return this.eth.estimateGas(_transactionRequest, blockFlags.latest).then((gas) => {
    return transactionApprover(_transactionRequest, gas).then((transactionRequest) => {
      const rawTransactionRequest = transactionRequest.toRawSigned()
      return this.eth.sendRawTransaction(rawTransactionRequest)
    })
  })
}

module.exports = Ultralightbeam
