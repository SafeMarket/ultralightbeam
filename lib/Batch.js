const arguguard = require('arguguard')

module.exports = function Batch(ultralightbeam) {
  arguguard('Batch', ['Ultralightbeam'], arguments)
  this.deferred = ultralightbeam.defer()
  this.parts = []
}
