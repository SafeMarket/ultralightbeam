const getBlockByFlagInterface = require('./interfaces/eth/getBlockByFlag')
const blockFlags = require('./blockFlags')
const BatchPart = require('./BatchPart')
const EventEmitter = require('events')

function BlockPoller(ultralightbeam) {
  this.ultralightbeam = ultralightbeam
  this.deferred = ultralightbeam.defer()
  this.emitter = new EventEmitter()
}

BlockPoller.prototype.start = function start(wait) {

  if (this.isPolling) {
    this.stop()
  }

  this.isPolling = true

  let blockPollerDeferred = this.ultralightbeam.defer()
  this.promise = blockPollerDeferred.promise

  this.setupInterval = setInterval(() => {

    const batchPart = new BatchPart(
      this.ultralightbeam,
      getBlockByFlagInterface,
      [blockFlags.latest, true]
    )

    batchPart.deferred.promise.then((block) => {
      if (
        !this.ultralightbeam.block
        || (!this.ultralightbeam.block.hash.equals(block.hash, 'hex'))
      ) {
        this.ultralightbeam.block = block
        this.emitter.emit('block', block)
        blockPollerDeferred.resolve(block)
        blockPollerDeferred = this.ultralightbeam.defer()
        this.promise = blockPollerDeferred.promise
      }
    })

    this.ultralightbeam.batch.parts.push(batchPart)

  }, wait)

  this.executeInterval = setInterval(() => {
    if (this.ultralightbeam.batch.parts.length > 0) {
      this.ultralightbeam.execute()
    }
  }, wait)
}

BlockPoller.prototype.stop = function stop() {
  this.isPolling = false
  clearInterval(this.setupInterval)
  clearInterval(this.executeInterval)
}

// eslint-disable-next-line max-len
function getTransactionReceiptOnBlock(ultralightbeam, transactionHash, blocksWaited) {

  return ultralightbeam.blockPoller.promise.then(() => {
    return ultralightbeam.eth.getTransactionReceipt(transactionHash).then((
      transactionReceipt
    ) => {
      if (transactionReceipt === null) {
        if (blocksWaited === ultralightbeam.defaults.maxBlocksToWait) {
          return ultralightbeam.reject(
            new errors.BlocksWaited(blocksWaited)
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
  })

}

// eslint-disable-next-line max-len
BlockPoller.prototype.pollForTransactionReceipt = function pollForTransactionReceipt(transactionHash) {
  if (!this.isPolling) {
    return ultralightbeam.reject(new errors.NotPollingError)
  }
  // eslint-disable-next-line max-len
  return getTransactionReceiptOnBlock(this.ultralightbeam, transactionHash, 0)
}

module.exports = BlockPoller
