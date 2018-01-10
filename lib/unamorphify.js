const stripType = require('./stripType')
const _ = require('lodash')

module.exports = function unamorphify(type, input) {
  if(_.isArray(input)) {
    return input.map((_input) => {
      return unamorphify(type, _input)
    })
  }
  const strippedType = stripType(type)
  const form = `web3.${strippedType}`
  return input.to(form)
}
