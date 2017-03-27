const Validator = require('arguguard/lib/Validator')

module.exports = new Validator('CountingNumber', (arg) => {
  if (isNaN(arg)) {
    throw new Error(`should be a number, received ${arg}`)
  }
  if (arg % 1 !== 0) {
    throw new Error(`should be an integer, received ${arg}`)
  }
  if (arg < 1) {
    throw new Error(`should be greater than or equal to 1, received ${arg}`)
  }
})
