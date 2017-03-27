const Validator = require('arguguard/lib/Validator')
const Amorph = require('../Amorph')

module.exports = new Validator('Word', (arg) => {
  if (!(arg instanceof Amorph)) {
    throw new Error(`should be instance of Amorph, received ${arg}`)
  }
  const length = arg.to('array').length
  if (length !== 32) {
    throw new Error(`should be 32 bytes long, received ${length}`)
  }
})
