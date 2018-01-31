const _ = require('lodash')
const defunction = require('defunction')
const v = require('./validates')

module.exports = defunction([v.string, v.string, v.pojo], v.undefined, function Interface(name, method, options) {
  _.merge(this, { name, method })
  _.merge(this, options)
})
