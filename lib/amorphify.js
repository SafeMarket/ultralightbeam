const stripType = require('./stripType')
const _ = require('lodash')

module.exports = function amorphify(type, output, Amorph) {
  const strippedType = stripType(type)
  if (!_.isArray(output)) {
    const form = `web3.${strippedType}`
    return new Amorph(output, form)
  }
  return output.map((_output) => {
    return amorphify(type, _output, Amorph)
  })
}
