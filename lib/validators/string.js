const Validator = require('../Validator')

module.exports = new Validator('String', 'a string', (arg) => {
  return typeof arg === 'string'
})