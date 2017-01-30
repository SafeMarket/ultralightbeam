const Q = require('q')
const bulk = require('bulk-require')
const interfaces = bulk(__dirname + '/lib/interfaces/', '**/*.js')
const Batch = require('./lib/Batch')
const Protocol = require('./lib/Protocol')
const debouncedExecute = require('./lib/debouncedExecute')
const BlockPoller = require('./lib/BlockPoller')
const Emitter = require('events')
const _ = require('lodash')
const TransactionMonitor = require('./lib/TransactionMonitor')

function Ultralightbeam(provider, _options) {

  this.options =  {
    blockPollerInterval: 1000,
    maxBlocksToWait: 3,
    transactionHook: (transactionRequest) => {

      const promises = []

      if (!transactionRequest.values.gas) {
        const gasPromise = this.eth.estimateGas(transactionRequest).then((gas) => {
          transactionRequest.set('gas', gas)
        })

        promises.push(gasPromise)
      }

      if (transactionRequest.values.from && !transactionRequest.values.nonce) {
        const noncePromise =  this.eth.getTransactionCount(
          transactionRequest.values.from.address
        ).then((
          transactionCount
        ) => {
          transactionRequest.set('nonce', transactionCount)
        })
        promises.push(noncePromise)
      }

      return Q.all(promises).then(() => {
        return transactionRequest
      })
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
  transactionRequest, _transactionHook, _maxBlocksToWait
) {
  const transactionHook = _transactionHook || this.options.transactionHook
  const maxBlocksToWait = _maxBlocksToWait || this.options.maxBlocksToWait
  return new TransactionMonitor(
    this,
    transactionRequest,
    transactionHook,
    maxBlocksToWait
  )
}

module.exports = Ultralightbeam
