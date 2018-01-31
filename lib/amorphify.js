const stripType = require('./stripType')
const _ = require('lodash')
const Amorph = require('amorph')
const amorphWeb = require('./amorphWeb3')

module.exports = function amorphify(type, output) {
  const strippedType = stripType(type)
  if (!_.isArray(output)) {
    return Amorph.from(amorphWeb[strippedType], output)
  }
  return output.map((_output) => {
    return amorphify(type, _output)
  })
}
