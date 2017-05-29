const Validator = require('arguguard/lib/Validator')

module.exports = new Validator('AmorphNaturalNumber', (arg) => {
  if (arg.constructor.name !== 'Amorph') {
    throw new Error(`should be instance of 'Amorph', received ${arg}`)
  }
  const number = arg.to('number')
  if (number % 1 !== 0) {
    throw new Error(`should be an integer, received ${arg}`)
  }
  if (number < 0) {
    throw new Error(`should be greater than or equal to 0, received ${arg}`)
  }
})
