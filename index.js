const Q = require('q')
const bulk = require('bulk-require')
const interfaces = bulk(__dirname + '/lib/interfaces/', '**/*.js')
const Batch = require('./lib/Batch')
const Protocol = require('./lib/Protocol')
const debouncedExecute = require('./lib/debouncedExecute')

function Ultralightbeam(provider, defaults) {
  this.id = 0
  this.provider = provider
  this.batch = new Batch(this)
  this.batches = []
  this.defaults = defaults || {}
  this.pollQueue = []
  this.poll(1000)
  this.web3 = new Protocol(this, interfaces.web3)
  this.net = new Protocol(this, interfaces.net)
  this.eth = new Protocol(this, interfaces.eth)
  this.miner = new Protocol(this, interfaces.miner)
}

Ultralightbeam.prototype.add = function add(manifest) {
  return this[manifest.protocol][manifest.name](...manifest.inputs)
}

Ultralightbeam.prototype.poll = function poll(wait) {

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

Ultralightbeam.prototype.pollForTransactionReceipt = function pollForTransactionReceipt(transactionHash) {
  const deferred = this.defer()
  this.pollQueue.push(() => {
    this.eth.getTransactionReceipt(transactionHash).then((
      transactionReceipt
    ) => {
      if (transactionReceipt === null) {
        this.pollForTransactionReceipt(transactionHash).then((
          _transactionReceipt
        ) => {
          deferred.resolve(_transactionReceipt)
        })
      } else {
        deferred.resolve(transactionReceipt)
      }
    })
  })
  return deferred.promise
}

Ultralightbeam.prototype.execute = function execute() {
  debouncedExecute(this)
}

Ultralightbeam.prototype._defer = function _defer() {
  return Q.defer()
}

Ultralightbeam.prototype.defer = function defer() {
  const deferred = this._defer()
  return deferred
}

module.exports = Ultralightbeam
