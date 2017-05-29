const Validator = require('arguguard/lib/Validator')

function test(arg) {
  if (arg.constructor.name === 'Amorph') {
    return
  } else if (arg instanceof Array) {
    arg.forEach(test)
  } else {
    throw new Error(`should be instance of Amorph or 'Array', received ${arg}`)
  }
}

module.exports = new Validator('Input', test)
