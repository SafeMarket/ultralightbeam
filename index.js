const interfacesPojo = require('./lib/interfacesPojo')
const Batch = require('./lib/Batch')
const Protocol = require('./lib/Protocol')
const _execute = require('./lib/execute')
const BlockPoller = require('./lib/BlockPoller')
const Emitter = require('events')
const _ = require('lodash')
const TransactionMonitor = require('./lib/TransactionMonitor')
const TransactionRequest = require('./lib/TransactionRequest')
const SolDeployTransactionRequest = require('./lib/SolDeployTransactionRequest')
const SolWrapper = require('./lib/SolWrapper')
const defunction = require('defunction')
const v = require('./lib/validates')
const Promise = require('bluebird')
const amorphHex = require('amorph-hex')
const amorphNumber = require('amorph-number')
const BlocksWaitedError = require('./lib/errors/BlocksWaited')

const Ultralightbeam = module.exports = defunction([v.object, v.pojo], v.undefined, function Ultralightbeam(provider, options) {

  this.options =  {
    blockPollerInterval: 1000,
    maxBlocksToWait: 3,
    executionDebounce: 100,
    gasMultiplier: 1.2,
    approve: defunction([v.transactionRequestish], v.promise, function approve(transactionRequest) {
      return Promise.resolve()
    })
  }
  _.merge(this.options, options)

  this.id = 0
  this.provider = provider
  this.batch = new Batch(this)
  this.batches = []
  this.web3 = new Protocol(this, interfacesPojo.web3)
  this.net = new Protocol(this, interfacesPojo.net)
  this.eth = new Protocol(this, interfacesPojo.eth)
  this.miner = new Protocol(this, interfacesPojo.miner)
  this.blockPoller = new BlockPoller(this)
  this.debouncedExecute = _.debounce(_execute, this.options.executionDebounce)

  this.blockPoller.start(this.options.blockPollerInterval)
  this.emitter = new Emitter
  this.addressCounters = {}
})

Ultralightbeam.prototype.getLatestBlock = defunction([], v.eventualBlock, function getLatestBlock() {
  if (this.blockPoller.block) {
    return this.resolve(this.blockPoller.block)
  }
  return this.blockPoller.blockPromise
})

Ultralightbeam.prototype.execute = defunction([], v.anything, function execute() {
  return this.debouncedExecute(this)
})

Ultralightbeam.prototype.defer = defunction([], v.promiseStub, function defer() {
  const deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
})

Ultralightbeam.prototype.reject = defunction([v.optionalAnything], v.promise, function reject(reason) {
  return Promise.reject(reason)
})

Ultralightbeam.prototype.resolve = defunction([v.optionalAnything], v.promise, function resolve(reason) {
  return Promise.resolve(reason)
})

Ultralightbeam.prototype.send = defunction([v.transactionRequestish], v.transactionMonitor, function send(transactionRequest) {
  return new TransactionMonitor(this, transactionRequest)
})

Ultralightbeam.prototype.solDeploy = defunction(
  [v.amorph, v.array, v.array, v.pojo],
  v.eventualSolWrapper,
  function solDeploy(bytecode, abi, inputs, options) {
    return new SolDeployTransactionRequest(this, bytecode, abi, inputs, options).send().getContractAddress().then((contractAddress) => {
      return new SolWrapper(this, abi, contractAddress)
    })
  }
)

Ultralightbeam.getTransactionRequest = defunction([v.pojo], v.transactionRequest, function getTransactionRequest(options) {
  return new TransactionRequest(this, options)
})

Ultralightbeam.prototype.getSolWrapper = defunction([v.amorph, v.array, v.array, v.pojo], v.solWrapper, function getSolWrapper(bytecode, abi, inputs, options) {
  return new SolWrapper(this, bytecode, abi, inputs, options)
})

Ultralightbeam.prototype.getNonce = defunction([v.address], v.eventualAmorph, function getNonce(address) {
  const addressHex = address.to(amorphHex.unprefixed)

  if (!this.addressCounters[addressHex]) {
    this.addressCounters[addressHex] = {
      startNonce: null,
      increment: 0
    }
  }

  const addressCounter = this.addressCounters[addressHex]
  const increment = addressCounter.increment
  addressCounter.increment ++

  if (addressCounter.startNonce) {
    return this.resolve(addressCounter.startNonce.as(amorphNumber.unsigned, (number) => {
      return number + increment
    }))
  }
  return this.eth.getTransactionCount(address).then((transactionCount) => {
    if (!addressCounter.startNonce) {
      addressCounter.startNonce = transactionCount
    }
    return transactionCount.as(amorphNumber.unsigned, (number) => {
      return number + increment
    })
  })
})

Ultralightbeam.prototype.waitForTransaction = defunction([v.amorph], v.eventualTransaction, function waitForTransaction(transactionHash) {
  const deferred = this.defer()
  let blocksWaited = 0
  const onBlock = (block) => {
    if (block.transactions) {
      block.transactions.forEach((transaction) => {
        if (!transaction.hash.equals(transactionHash)) {
          return
        }
        deferred.resolve(transaction)
        this.blockPoller.emitter.removeListener('block', onBlock)
      })
    }
    blocksWaited ++
    if (blocksWaited > this.options.maxBlocksToWait) {
      this.blockPoller.emitter.removeListener('block', onBlock)
      const blocksWaitedError = new BlocksWaitedError(`No result after waiting for ${blocksWaited} blocks`)
      deferred.reject(blocksWaitedError)
    }
  }
  this.blockPoller.emitter.on('block', onBlock)
  return deferred.promise
})
