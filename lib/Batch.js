const defunction = require('defunction')
const v = require('./validates')

module.exports = defunction([v.ultralightbeam], v.undefined, function Batch(ultralightbeam) {
  this.deferred = ultralightbeam.defer()
  this.parts = []
})
