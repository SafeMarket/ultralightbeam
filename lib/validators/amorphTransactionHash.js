const Validator = require('../Validator')
const Amorph = require('../Amorph')

module.exports = new Validator(
  'Amorph transactionHash',
  'transactionHash as Amorph (32 bytes)',
  (arg) => {
    return ((arg instanceof Amorph) && (arg.to('array').length === 32))
  }
)
