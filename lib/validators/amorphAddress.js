const Validator = require('../Validator')
const Amorph = require('../Amorph')

module.exports = new Validator(
  'Amorph address',
  'address as Amorph (20 bytes)',
  (arg) => {
    return ((arg instanceof Amorph) && (arg.to('uint8Array').length === 20))
  }
)
