const Validator = require('../Validator')
const Amorph = require('../Amorph')

module.exports = new Validator('Amorph address', 'instance of Amorph and 20 bytes long', (arg) => {
  return ((arg instanceof Amorph) && (arg.to('uint8Array').length === 20))
})