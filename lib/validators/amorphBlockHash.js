const Validator = require('../Validator')
const Amorph = require('../Amorph')

module.exports = new Validator(
  'Amorph blockHash',
  'blockHash as Amorph (32 bytes)',
  (arg) => {
    return ((arg instanceof Amorph) && (arg.to('uint8Array').length === 32))
  }
)
