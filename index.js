const Q = require('q')
const bulk = require('bulk-require')
const interfaces = bulk(__dirname + '/lib/interfaces/', '**/*.js')
const Batch = require('./lib/Batch')
const Protocol = require('./lib/Protocol')
const debouncedExecute = require('./lib/debouncedExecute')
const BlockPoller = require('./lib/BlockPoller')
const Emitter = require('events')
const _ = require('lodash')

function Ultralightbeam(provider, defaults) {

  this.defaults = _.merge({
    deployBlocksWaitMax: 3
  }, defaults || {})

  this.id = 0
  this.provider = provider
  this.batch = new Batch(this)
  this.batches = []
  this.defaults = defaults || {}
  this.web3 = new Protocol(this, interfaces.web3)
  this.net = new Protocol(this, interfaces.net)
  this.eth = new Protocol(this, interfaces.eth)
  this.miner = new Protocol(this, interfaces.miner)
  this.blockPoller = new BlockPoller(this)
  this.blockPoller.start(1000)
  this.emitter = new Emitter
}

Ultralightbeam.prototype.add = function add(manifest) {
  return this[manifest.protocol][manifest.name](...manifest.inputs)
}

// eslint-disable-next-line max-len
function getTransactionReceiptOnBlock(ultralightbeam, transactionHash, blocksWaited) {

  return ultralightbeam.eth.getTransactionReceipt(transactionHash).then((
    transactionReceipt
  ) => {
    if (transactionReceipt === null) {
      if (blocksWaited === ultralightbeam.defaults.deployBlocksWaitMax) {
        return ultralightbeam.reject(
          new errors.DeployBlocksWaitMax(blocksWaited)
        )
      }
      return getTransactionReceiptOnBlock(
        ultralightbeam,
        transactionHash,
        blocksWaited + 1
      )
    }
    return transactionReceipt
  })

}

Ultralightbeam.prototype.deploy = function deploy(transactionRequest) {
  if (!this.blockPoller.isPolling) {
    throw new errors.CannotDeployWithoutPollingError
  }
  // eslint-disable-next-line max-len
  return this.eth.sendTransaction(transactionRequest).then((transactionHash) => {
    return getTransactionReceiptOnBlock(this, transactionHash, 0)
  })
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

module.exports = Ultralightbeam
