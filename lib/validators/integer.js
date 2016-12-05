const Validator = require('../Validator')

module.exports = new Validator('integer', 'an integer', (arg) => {
  return Number.isInteger(arg)
})