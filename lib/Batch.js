const arguguard = require('arguguard')

module.exports = function Batch(ultralightbeam) {
  arguguard('Batch', [Object], arguments)
  this.deferred = ultralightbeam.defer()
  this.parts = []
}
