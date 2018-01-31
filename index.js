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
const NoFromError = require('./lib/errors/NoFrom')
const BalanceTooLowError = require('./lib/errors/BalanceTooLow')
const ExceedsBlockLimitError = require('./lib/errors/ExceedsBlockLimit')
const Promise = require('bluebird')
const amorphHex = require('amorph-hex')
const amorphBignumber = require('amorph-bignumber')

const Ultralightbeam = module.exports = defunction([v.object, v.pojo], v.undefined, function Ultralightbeam(provider, options) {

  this.options =  {
    blockPollerInterval: 1000,
    maxBlocksToWait: 3,
    executionDebounce: 100,
    gasMultiplier: 1.2,
    gasCostHook: (gasCost) => {
      return this.resolve()
    },
    transactionHook: (transactionRequest) => {

      if (!transactionRequest.values.from) {
        throw new NoFromError('Set either transactionRequest.from or ultralightbeam.defaultAccount')
      }

      let noncePromise
      let gasPricePromise
      let gasPromise
      let gasLimitPromise

      if (transactionRequest.values.nonce) {
        noncePromise = this.resolve(transactionRequest.values.nonce)
      } else {
        noncePromise = this.eth.getTransactionCount(transactionRequest.values.from.address)
      }

      if (transactionRequest.values.gasPrice) {
        gasPricePromise = this.resolve(transactionRequest.values.gasPrice)
      } else {
        if (this.blockPoller.gasPrice) {
          gasPricePromise = this.resolve(this.blockPoller.gasPrice)
        } else {
          gasPricePromise = this.blockPoller.gasPricePromise
        }
      }

      if (transactionRequest.values.gas) {
        gasPromise = this.resolve(transactionRequest.values.gas)
      } else {
        gasPromise = this.eth.estimateGas(transactionRequest).then((gas) => {
          return gas.as(amorphBignumber.unsigned, (bignumber) => {
            return bignumber.times(this.options.gasMultiplier).floor()
          })
        })
      }

      if (this.blockPoller.block) {
        gasLimitPromise = this.resolve(this.blockPoller.block.gasLimit)
      } else {
        gasLimitPromise = this.blockPoller.blockPromise.then((block) => {
          return block.gasLimit
        })
      }

      return Promise.all([
        noncePromise,
        gasPromise,
        gasPricePromise,
        gasLimitPromise,
        this.eth.getBalance(transactionRequest.values.from.address)
      ]).then((results) => {
        const nonce = results[0]
        const gas = results[1]
        const gasPrice = results[2]
        const gasLimit = results[3]
        const balance = results[4]

        if (gas.to(amorphBignumber.unsigned).gt(gasLimit.to(amorphBignumber.unsigned))) {
          throw new ExceedsBlockLimitError(`Gas (${gas.to(amorphBignumber.unsigned)}) exceeds block gas limit (${gasLimit.to(amorphBignumber.unsigned)})`)
        }
        const gasCost = gas.as(amorphBignumber.unsigned, (bignumber) => {
          return bignumber.times(gasPrice.to(amorphBignumber.unsigned))
        })

        if (gasCost.to(amorphBignumber.unsigned).gt(balance.to(amorphBignumber.unsigned))) {
          throw new BalanceTooLowError(`This transaction costs ${gasCost.to(amorphBignumber.unsigned)} wei. Account ${transactionRequest.values.from.address.to(amorphHex.prefixed)} only has ${balance.to(amorphBignumber.unsigned)} wei.`)
        }

        return this.options.gasCostHook(gasCost).then(() => {
          transactionRequest.set('nonce', nonce)
          transactionRequest.set('gas', gas)
          transactionRequest.set('gasPrice', gasPrice)
          return transactionRequest
        })
      })
    }
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
