const Validator = require('../Validator')
const Amorph = require('../Amorph')

module.exports = new Validator(
  'Amorph address',
  'address as Amorph (20 bytes)',
  (arg) => {
    return (
      (arg instanceof Amorph)
      && (arg.to('bignumber').gte(0))
      && (arg.to('bignumber').isInteger())
    )
  }
)
