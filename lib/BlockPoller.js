const getBlockByFlagInterface = require('./interfaces/eth/getBlockByFlag')
const getGasPriceInterface = require('./interfaces/eth/getGasPrice')
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

  let blockDeferred = this.ultralightbeam.defer()
  let gasPriceDeferred = this.ultralightbeam.defer()

  this.blockPromise = blockDeferred.promise
  this.gasPricePromise = gasPriceDeferred.promise

  this.setupInterval = setInterval(() => {

    const blockBatchPart = new BatchPart(
      this.ultralightbeam,
      getBlockByFlagInterface,
      [blockFlags.latest, true]
    )
    const gasPriceBatchPart = new BatchPart(
      this.ultralightbeam,
      getGasPriceInterface,
      []
    )

    blockBatchPart.deferred.promise.then((block) => {
      if (
        !this.block
        || (!this.block.hash.equals(block.hash, 'hex'))
      ) {
        this.block = block
        this.emitter.emit('block', block)
        blockDeferred.resolve(block)
        blockDeferred = this.ultralightbeam.defer()
        this.blockPromise = blockDeferred.promise
      }
    })

    gasPriceBatchPart.deferred.promise.then((gasPrice) => {
      if (
        !this.gasPrice
        || (!this.gasPrice.equals(gasPrice, 'number'))
      ) {
        this.gasPrice = gasPrice
        this.emitter.emit('gasPrice', gasPrice)
        gasPriceDeferred.resolve(block)
        gasPriceDeferred = this.ultralightbeam.defer()
        this.gasPricePromise = gasPriceDeferred.promise
      }
    })

    this.ultralightbeam.batch.parts.push(blockBatchPart, gasPriceBatchPart)

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

  return ultralightbeam.blockPoller.blockPromise.then(() => {
    return ultralightbeam.eth.getTransactionReceipt(transactionHash).then((
      transactionReceipt
    ) => {
      if (transactionReceipt === null) {
        if (blocksWaited === ultralightbeam.options.maxBlocksToWait) {
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
