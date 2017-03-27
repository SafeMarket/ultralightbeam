const _ = require('lodash')
const arguguard = require('arguguard')

module.exports = function Interface(name, method, inputDescriptions, options) {
  arguguard('Interface', ['string', 'string', Array, Object], arguments)
  _.merge(this, { name, method, inputDescriptions })
  _.merge(this, options)
}
