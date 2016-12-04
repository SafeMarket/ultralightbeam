const Validator = require('../Validator')
const Amorph = require('../../modules/Amorph')

module.exports = new Validator('Amorph', 'instance of Amorph', (arg) => {
  return arg instanceof Amorph
})