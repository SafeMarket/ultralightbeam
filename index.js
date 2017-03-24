const Q = require('q')
const bulk = require('bulk-require')
const interfaces = bulk(__dirname + '/lib/interfaces/', '**/*.js')
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
const errors = require('./lib/errors')

function Ultralightbeam(provider, _options) {

  this.options =  {
    blockPollerInterval: 1000,
    maxBlocksToWait: 3,
    executionDebounce: 100,
    deduceOOGErrors: true,
    gasMultiplier: 1.2,
    transactionHook: (transactionRequest) => {

      if (!transactionRequest.values.from) {
        throw new errors.NoFromError('Set either transactionRequest.from or ultralightbeam.defaultAccount')
      }

      let noncePromise
      let gasPricePromise
      let gasPromise
      let gasLimitPromise

      const promises = []

      if (transactionRequest.values.nonce) {
        noncePromise = Q.resolve(transactionRequest.values.nonce)
      } else {
        noncePromise = this.eth.getTransactionCount(transactionRequest.values.from.address)
      }

      if (transactionRequest.values.gasPrice) {
        gasPricePromise = Q.resolve(transactionRequest.values.gasPrice)
      } else {
        if (this.blockPoller.gasPrice) {
          gasPricePromise = Q.resolve(this.blockPoller.gasPrice)
        } else {
          gasPricePromise = this.blockPoller.gasPricePromise
        }
      }

      if (transactionRequest.values.gas) {
        gasPromise = Q.resolve(transactionRequest.values.gas)
      } else {
        gasPromise = this.eth.estimateGas(transactionRequest).then((gas) => {
          return gas.as('bignumber', (bignumber) => {
            return bignumber.times(this.options.gasMultiplier).floor()
          })
        })
      }

      if (this.blockPoller.block) {
        gasLimitPromise = Q.resolve(this.blockPoller.block.gasLimit)
      } else {
        gasLimitPromise = this.blockPoller.blockPromise.then((block) => {
          return block.gasLimit
        })
      }

      return Q.all([
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

        if (gas.to('bignumber').gt(gasLimit.to('bignumber'))) {
          throw new errors.ExceedsBlockLimitError(`Gas (${gas.to('number')}) exceeds block gas limit (${gasLimit})`)
        }
        const gasCost = gas.as('bignumber', (bignumber) => {
          return bignumber.times(gasPrice.to('bignumber'))
        })
        if (gasCost.to('bignumber').gt(balance.to('bignumber'))) {
          throw new errors.BalanceTooLowError(`This transaction costs ${gasCost.to('number')} wei. Account ${from.address.to('hex.prefixed')} only has ${balance.to('number')} wei.`)
        }

        transactionRequest.set('nonce', nonce)
        transactionRequest.set('gas', gas)
        transactionRequest.set('gasPrice', gasPrice)

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
  this.debouncedExecute = _.debounce(_execute, this.options.executionDebounce)

  this.blockPoller.start(this.options.blockPollerInterval)
  this.emitter = new Emitter
}

Ultralightbeam.prototype.execute = function execute() {
  return this.debouncedExecute(this)
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

Ultralightbeam.prototype.send = function send(
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

Ultralightbeam.prototype.solDeploy = function solDeploy(bytecode, abi, inputs, options) {
  return new SolDeployTransactionRequest(this, bytecode, abi, inputs, options).send().getContractAddress().then((contractAddress) => {
    return new SolWrapper(this, abi, contractAddress)
  })
}

Ultralightbeam.getTransactionRequest = function getTransactionRequest(options) {
  return new TransactionRequest(this, options)
}

Ultralightbeam.prototype.getSolWrapper = function getSolWrapper(bytecode, abi, inputs, options) {
  return new SolDeploy(this, bytecode, abi, inputs, options)
}

module.exports = Ultralightbeam
