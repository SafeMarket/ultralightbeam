const arguguard = require('arguguard')

module.exports = function BlockFlag(toParam) {
  arguguard('BlockFlag', ['function'], arguments)
  this.toParam = toParam
}
