const _ = require('lodash')

function Solquest(protocol, name, args) {
  _.merge(this, { protocol, name, args })
}

module.exports = Solquest