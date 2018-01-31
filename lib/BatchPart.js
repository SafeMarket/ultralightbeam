const _ = require('lodash')
const defunction = require('defunction')
const v = require('./validates')

module.exports = defunction([v.ultralightbeam, v.interface, v.array], v.undefined, function BatchPart(ultralightbeam, _interface, inputs) {
  this.deferred = ultralightbeam.defer()
  _.merge(this, { interface: _interface, inputs })
})
