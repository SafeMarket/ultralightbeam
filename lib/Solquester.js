const Q = require('q')
const Amorph = require('../modules/Amorph')
const _ = require('lodash')
const Protocol = require('./Protocol')
const requireDirectory = require('require-directory')

function Batch() {
  this.execution = Q.defer()
  this.payload = []
  this.outputters = []
  this.handlers = []
}

function Solquester(provider, defaults) {
  const solquester = this
  this.provider = provider
  this.batch = new Batch()
  this.batches = []
  this.defaults = defaults || {}
  this.pollQueue = []
  this.poll(1000)
  this.web3 = new Protocol(this, requireDirectory(module, './interfaces/web3'))
  this.net = new Protocol(this, requireDirectory(module, './interfaces/net'))
  this.eth = new Protocol(this, requireDirectory(module, './interfaces/eth'))
  this.miner = new Protocol(this, requireDirectory(module, './interfaces/miner'))
}

Solquester.Batch = Batch
Solquester.TransactionReceipt = require('./TransactionReceipt')


Solquester.prototype.add = function add(options) {
  this[options.protocol][options.name].apply(this, options.args)
  return this
}

Solquester.prototype.poll = function(wait) {

  if (this.pollInterval !== undefined) {
    clearInterval(this.pollInterval)
  } 

  this.pollInterval = setInterval(() => {
    this.pollQueue.forEach((func) => {
      func.apply(this)
    })
    this.pollQueue.length = 0
  }, wait)

}

Solquester.prototype.withHandler = function (_onSuccess, _onError) {

  this.promise = Q.Promise((resolve, reject, notify) => {

    const onSuccess = (output) => {
      if (_onSuccess) {
        _onSuccess(output)
      }
      resolve(output)
      return output
    }

    const onError = (err) => {
      if (_onError) {
        _onError(output)
      }
      reject(err)
      return err
    }

    this.batch.handlers[this.batch.payload.length - 1] = { onSuccess, onError }

  });

  return this

}

Solquester.prototype.pollForTransactionReciept = function (transactionHash) {
  const deferred = Q.defer()
  this.pollQueue.push(() => {
    this.eth.getTransactionReceipt(transactionHash).promise.then((transactionReceipt) => {
      if (transactionReceipt === null) {
        this.pollForTransactionReciept(transactionHash).then((transactionReceipt) => {
          deferred.resolve(transactionReceipt)
        })
      } else {
        deferred.resolve(transactionReceipt)
      }
    })
  })
  return deferred.promise
}

const execute = _.debounce((solquester) => {

  const batch = solquester.batch

  solquester.batch = new Batch
  solquester.batches.push(batch)

  solquester.provider.sendAsync(batch.payload, (err, results) => {

    if (err && !results) {
      batch.handlers.forEach((handler) => { handler.onError(err) })
      batch.execution.reject(err)
      return
    }

    batch.outputs = results.map((result, index) => {

      if (result.error) {
        batch.handlers[index].onError(result.error)
        return result.error
      }

      const output = 
        batch.outputters[index] ?
          batch.outputters[index](result.result)
          : result.result
      
      batch.handlers[index].onSuccess(output)
      return result.result
    })

    if (err) {
      batch.execution.reject(err)
      return
    }

    batch.execution.resolve(batch.outputs)

  })
}, 100)

Solquester.prototype.execute = function () {
  execute(this)
}

module.exports = Solquester
