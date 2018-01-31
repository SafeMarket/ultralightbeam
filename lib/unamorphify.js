const stripType = require('./stripType')
const _ = require('lodash')
const amorphWeb3 = require('./amorphWeb3')

module.exports = function unamorphify(type, input) {
  if(_.isArray(input)) {
    return input.map((_input) => {
      return unamorphify(type, _input)
    })
  }
  const strippedType = stripType(type)
  return input.to(amorphWeb3[strippedType])
}
