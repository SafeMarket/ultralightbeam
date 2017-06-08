const Validator = require('arguguard/lib/Validator')

module.exports = new Validator('Address', (arg) => {
  if (arg.constructor.name !== 'Amorph') {
    throw new Error(`should be instance of 'Amorph', received ${arg}`)
  }
  const length = arg.to('array').length
  if (length !== 20) {
    throw new Error(`should be 20 bytes long, received ${length}`)
  }
})
