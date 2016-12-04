const Q = require('q')

module.exports = function Batch() {
  this.execution = Q.defer()
  this.methodNames = []
  this.args = []
  this.interfaces = []
  this.executions = []
  this.blockFlags = []
}