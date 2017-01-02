const Validator = require('../Validator')
const Amorph = require('../Amorph')

module.exports = new Validator(
  'Amorph address',
  'natural number (0, 1, 2, ...) as amorph',
  (arg) => {
    return (
      (arg instanceof Amorph)
      && (arg.to('bignumber').gte(0))
      && (arg.to('bignumber').isInteger())
    )
  }
)
