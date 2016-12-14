const Validator = require('../Validator')
const isPojo = require('is-pojo')

module.exports = new Validator('pojo', 'a pojo', (arg) => {
  return isPojo(arg)
})
