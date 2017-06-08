const _ = require('lodash')
const arguguard = require('arguguard')

function BatchPart(ultralightbeam, _interface, inputs) {
  arguguard('arguguard', ['Ultralightbeam', 'Interface', 'Array'], arguments)
  this.deferred = ultralightbeam.defer()
  _.merge(this, { interface: _interface, inputs })
}

module.exports = BatchPart
