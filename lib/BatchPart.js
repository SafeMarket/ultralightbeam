const _ = require('lodash')

function BatchPart(ultralightbeam, _interface, inputs) {
  this.deferred = ultralightbeam.defer()
  _.merge(this, { interface: _interface, inputs })
}

module.exports = BatchPart
