const Q = require('q')
const Amorph = require('../modules/Amorph')
const _ = require('lodash')
const Protocol = require('./Protocol')
const BlockFlag = require('./BlockFlag')
const requireDirectory = require('require-directory')

function Batch() {
  this.execution = Q.defer()
  this.args = []
  this.interfaces = []
  this.executions = []
  this.blockFlags = []
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
  return this[options.protocol][options.name].apply(this, options.args)
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

Solquester.prototype.pollForTransactionReciept = function (transactionHash) {
  const deferred = Q.defer()
  this.pollQueue.push(() => {
    this.eth.getTransactionReceipt(transactionHash).then((transactionReceipt) => {
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

  const payloads = batch.interfaces.map((interface, index) => {

    const args = batch.args[index]
    const params = interface.inputter ?
      interface.inputter.apply(solquester, args).map((param) => {
        if (param instanceof BlockFlag) {
          if (solquester.batch.blockFlags[index]) {
            return solquester.batch.blockFlags[index].toParam()
          } else {
            return param.toParam()
          }
        }
        return param
      })
      : args

    return {
      method: interface.method,
      params
    }

  })

  solquester.provider.sendAsync(payloads, (err, results) => {

    if (err && !results) {
      batch.executions.forEach((execution) => { deferred.reject(err) })
      batch.execution.reject(err)
      return
    }

    batch.outputs = results.map((result, index) => {

      if (result.error) {
        batch.executions[index].reject(result.error)
        return result.error
      }

      const args = batch.args[index]
      const output = 
        batch.interfaces[index].outputter ?
          batch.interfaces[index].outputter(result.result, args)
          : result.result
      
      batch.executions[index].resolve(output)
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
