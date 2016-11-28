const Q = require('q')
const coder = require('web3/lib/solidity/coder')
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
  this.web3 = new Protocol(this, requireDirectory(module, './interfaces/web3'))
  this.net = new Protocol(this, requireDirectory(module, './interfaces/net'))
  this.eth = new Protocol(this, requireDirectory(module, './interfaces/eth'))
}

Solquester.Batch = Batch
Solquester.TransactionReceipt = require('./TransactionReceipt')


Solquester.prototype.add = function add(options) {
  this[options.protocol][options.name].apply(this, options.args)
  return this
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


const execute = _.debounce((solquester) => {

  const batch = solquester.batch

  solquester.batch = new Batch
  solquester.batches.push(batch)

  solquester.provider.sendAsync(batch.payload, (err, results) => {

    if (err) {
      batch.execution.reject(err)
      return
    }

    batch.outputs = results.map((result, index) => {
      if (batch.outputters[index]) {
        return batch.outputters[index](result.result)
      }
      return result.result
    })
    _.forEach(batch.handlers, (handler, index) => {
      handler.onSuccess(batch.outputs[index])
    })

    batch.execution.resolve(batch.outputs)

  })
}, 100)

Solquester.prototype.execute = function () {
  execute(this)
}

module.exports = Solquester
