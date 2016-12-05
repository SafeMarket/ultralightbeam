const Validator = require('../Validator')
const Amorph = require('../../modules/Amorph')

module.exports = new Validator('Amorph transactionHash', 'instance of Amorph and 32 bytes long', (arg) => {
  return ((arg instanceof Amorph) && (arg.to('uint8Array').length === 32))
})