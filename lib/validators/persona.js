const Validator = require('../Validator')
const Persona = require('../Persona')

module.exports = new Validator('Persona', 'instance of Persona', (arg) => {
  return arg instanceof Persona
})
