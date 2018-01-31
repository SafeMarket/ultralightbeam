const defunction = require('defunction')
const v = require('./validates')

module.exports = defunction([v.function], v.undefined, function BlockFlag(toParam) {
  this.toParam = toParam
})
