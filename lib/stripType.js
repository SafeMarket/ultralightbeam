const defunction = require('defunction')
const v = require('./validates')

module.exports = defunction([v.string], v.string, function stripType(type) {
  return type.replace(/[^a-z]/g, '')
})
