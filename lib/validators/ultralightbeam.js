const Validator = require('../Validator')
const Ultralightbeam = require('../../')

module.exports = new Validator('Ultralightbeam', 'instance of Ultralightbeam', (arg) => {
  return arg instanceof Ultralightbeam
})
