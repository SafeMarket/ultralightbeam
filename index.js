const Q = require('q')
const _ = require('lodash')
const bulk = require('bulk-require')

function Ultralightbeam(provider, defaults) {
  const ultralightbeam = this
  this.provider = provider
  this.batch = new Ultralightbeam.Batch()
  this.batches = []
  this.defaults = defaults || {}
  this.pollQueue = []
  this.poll(1000)
  this.web3 = new Ultralightbeam.Protocol(this, Ultralightbeam.interfaces.web3)
  this.net = new Ultralightbeam.Protocol(this, Ultralightbeam.interfaces.net)
  this.eth = new Ultralightbeam.Protocol(this, Ultralightbeam.interfaces.eth)
  this.miner = new Ultralightbeam.Protocol(this, Ultralightbeam.interfaces.miner)
}

_.merge(Ultralightbeam, bulk(__dirname+'/lib', '**/*.js'))

Ultralightbeam.prototype.add = function add(options) {
  return this[options.protocol][options.name].apply(this, options.args)
}

Ultralightbeam.prototype.poll = function(wait) {

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

Ultralightbeam.prototype.pollForTransactionReceipt = function (transactionHash) {
  const deferred = Q.defer()
  this.pollQueue.push(() => {
    this.eth.getTransactionReceipt(transactionHash).then((transactionReceipt) => {
      if (transactionReceipt === null) {
        this.pollForTransactionReceipt(transactionHash).then((transactionReceipt) => {
          deferred.resolve(transactionReceipt)
        })
      } else {
        deferred.resolve(transactionReceipt)
      }
    })
  })
  return deferred.promise
}

const execute = _.debounce((ultralightbeam) => {

  const batch = ultralightbeam.batch

  ultralightbeam.batch = new Ultralightbeam.Batch
  ultralightbeam.batches.push(batch)

  const payloads = batch.interfaces.map((interface, index) => {

    const args = batch.args[index]
    const params = interface.inputter ?
      interface.inputter.apply(ultralightbeam, args)
      : args

    return {
      method: interface.method,
      params
    }

  })

  ultralightbeam.provider.sendAsync(payloads, (err, results) => {

    if (err && !results) {
      batch.executions.forEach((execution) => { execution.reject(err) })
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

Ultralightbeam.prototype.execute = function () {
  execute(this)
}

module.exports = Ultralightbeam
