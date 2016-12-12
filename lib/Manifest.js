const _ = require('lodash')

function Manifest(protocol, name, inputs, formatter) {
  _.merge(this, { protocol, name, inputs, formatter })
}

module.exports = Manifest
