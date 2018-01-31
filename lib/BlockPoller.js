const getBlockByFlagInterface = require('./interfaces/eth/getBlockByFlag')
const getGasPriceInterface = require('./interfaces/eth/getGasPrice')
const blockFlags = require('./blockFlags')
const BatchPart = require('./BatchPart')
const EventEmitter = require('events')
const defunction = require('defunction')
const v = require('./validates')

const BlockPoller = module.exports = defunction([v.ultralightbeam], v.undefined, function BlockPoller(ultralightbeam) {
  this.ultralightbeam = ultralightbeam
  this.deferred = ultralightbeam.defer()
  this.emitter = new EventEmitter()
})

BlockPoller.prototype.start = defunction([v.number], v.undefined, function start(wait) {

  if (this.isPolling) {
    this.stop()
  }

  this.isPolling = true

  let deferredBlock = this.ultralightbeam.defer()
  let deferredGasPrice = this.ultralightbeam.defer()

  this.blockPromise = deferredBlock.promise
  this.gasPricePromise = deferredGasPrice.promise

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
        || (!this.block.hash.equals(block.hash))
      ) {
        this.block = block
        deferredBlock.resolve(block)
        this.emitter.emit('block', block)
        deferredBlock = this.ultralightbeam.defer()
        this.blockPromise = deferredBlock.promise
      }
    })

    gasPriceBatchPart.deferred.promise.then((gasPrice) => {
      if (
        !this.gasPrice
        || (!this.gasPrice.equals(gasPrice))
      ) {
        this.gasPrice = gasPrice
        deferredGasPrice.resolve(gasPrice)
        this.emitter.emit('gasPrice', gasPrice)
        deferredGasPrice = this.ultralightbeam.defer()
        this.gasPricePromise = deferredGasPrice.promise
      }
    })

    this.ultralightbeam.batch.parts.push(blockBatchPart, gasPriceBatchPart)

  }, wait)

  this.executeInterval = setInterval(() => {
    if (this.ultralightbeam.batch.parts.length > 0) {
      this.ultralightbeam.execute()
    }
  }, wait)
})

BlockPoller.prototype.stop = defunction([], v.undefined, function stop() {
  this.isPolling = false
  clearInterval(this.setupInterval)
  clearInterval(this.executeInterval)
})

module.exports = BlockPoller
