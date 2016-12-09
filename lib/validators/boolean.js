const Validator = require('../Validator')

module.exports = new Validator('Boolean', 'a boolean', (arg) => {
  return typeof arg === 'boolean'
})
