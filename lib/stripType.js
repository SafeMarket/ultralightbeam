const arguguard = require('arguguard')

module.exports = function stripType(type) {
  arguguard('stripType', ['string'], arguments)
  return type.replace(/[^a-z]/g, '')
}
