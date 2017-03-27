const _ = require('lodash')
const arguguard = require('arguguard')
const Interface = require('./Interface')

function BatchPart(ultralightbeam, _interface, inputs) {
  arguguard('arguguard', [Object, Interface, Array], arguments)
  this.deferred = ultralightbeam.defer()
  _.merge(this, { interface: _interface, inputs })
}

module.exports = BatchPart
