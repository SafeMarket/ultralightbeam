const _ = require('lodash')

function Manifest(protocol, name, args) {
  _.merge(this, { protocol, name, args })
}

module.exports = Manifest