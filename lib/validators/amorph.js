const Validator = require('../Validator')
const Amorph = require('../Amorph')

module.exports = new Validator('Amorph', 'instance of Amorph', (arg) => {
  return arg instanceof Amorph
})
