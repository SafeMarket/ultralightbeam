const Validator = require('../Validator')

module.exports = new Validator('array', 'an array', (arg) => {
  return Array.isArray(arg)
})
