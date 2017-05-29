const Validator = require('arguguard/lib/Validator')

module.exports = new Validator('Word', (arg) => {
  if (arg.constructor.name !== 'Amorph') {
    throw new Error(`should be instance of 'Amorph', received ${arg}`)
  }
  const length = arg.to('array').length
  if (length !== 32) {
    throw new Error(`should be 32 bytes long, received ${length}`)
  }
})
