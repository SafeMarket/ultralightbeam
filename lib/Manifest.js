const _ = require('lodash')

function Manifest(protocol, name, inputs) {
  _.merge(this, { protocol, name, inputs })
}

module.exports = Manifest
