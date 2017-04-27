const Validator = require('arguguard/lib/Validator')
const Amorph = require('../Amorph')

function test(arg) {
  if (arg instanceof Amorph) {
    return
  } else if (arg instanceof Array) {
    arg.forEach(test)
  } else {
    throw new Error(`should be instance of Amorph or 'Array', received ${arg}`)
  }
}

module.exports = new Validator('Input', test)
