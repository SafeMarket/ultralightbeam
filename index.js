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
const arguguard = require('arguguard')
const Amorph = require('./lib/Amorph')
const NoFromError = require('./lib/errors/NoFrom')
const BalanceTooLowError = require('./lib/errors/BalanceTooLow')
const ExceedsBlockLimitError = require('./lib/errors/ExceedsBlockLimit')

function Ultralightbeam(provider, options) {
  arguguard('Ultralightbeam', [Object, Object], arguments)

  this.options =  {
    arguguard: {},
    blockPollerInterval: 1000,
    maxBlocksToWait: 3,
    executionDebounce: 100,
    deduceOOGErrors: true,
    gasMultiplier: 1.2,
    gasCostHook: (gasCost) => {
      return Q.resolve()
    },
    transactionHook: (transactionRequest) => {

      if (!transactionRequest.values.from) {
        throw new NoFromError('Set either transactionRequest.from or ultralightbeam.defaultAccount')
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
          throw new ExceedsBlockLimitError(`Gas (${gas.to('number')}) exceeds block gas limit (${gasLimit})`)
        }
        const gasCost = gas.as('bignumber', (bignumber) => {
          return bignumber.times(gasPrice.to('bignumber'))
        })

        if (gasCost.to('bignumber').gt(balance.to('bignumber'))) {
          throw new BalanceTooLowError(`This transaction costs ${gasCost.to('number')} wei. Account ${transactionRequest.values.from.address.to('hex.prefixed')} only has ${balance.to('number')} wei.`)
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
  _.merge(arguguard.options, this.options.arguguard)

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
  arguguard('ultralightbeam.execute', [], arguments)
  return this.debouncedExecute(this)
}

Ultralightbeam.prototype.defer = function defer() {
  arguguard('ultralightbeam.defer', [], arguments)
  return Q.defer()
}

Ultralightbeam.prototype.reject = function reject(reason) {
  arguguard('ultralightbeam.reject', ['string'], arguments)
  return Q.reject(reason)
}

Ultralightbeam.prototype.resolve = function resolve(reason) {
  arguguard('ultralightbeam.reject', ['string'], arguments)
  return Q.resolve(reason)
}

Ultralightbeam.prototype.send = function send(transactionRequest) {
  arguguard('ultralightbeam.send', [TransactionRequest], arguments)
  return new TransactionMonitor(this, transactionRequest)
}

Ultralightbeam.prototype.solDeploy = function solDeploy(bytecode, abi, inputs, options) {
  arguguard('ultralightbeam.solDeploy', [Amorph, Array, Array, Object], arguments)
  return new SolDeployTransactionRequest(this, bytecode, abi, inputs, options).send().getContractAddress().then((contractAddress) => {
    return new SolWrapper(this, abi, contractAddress)
  })
}

Ultralightbeam.getTransactionRequest = function getTransactionRequest(options) {
  arguguard('ultralightbeam.getTransactionRequest', [Object])
  return new TransactionRequest(this, options)
}

Ultralightbeam.prototype.getSolWrapper = function getSolWrapper(bytecode, abi, inputs, options) {
  arguguard('ultralightbeam.getSolWrapper', [Amorph, Array, Array, Object])
  return new SolDeploy(this, bytecode, abi, inputs, options)
}

module.exports = Ultralightbeam
