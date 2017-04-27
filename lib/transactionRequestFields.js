const addressValidator = require('./validators/address')
const amorphNaturalNumberValidator = require('./validators/amorphNaturalNumber')

module.exports = {
  from: 'Account',
  to: addressValidator,
  value: amorphNaturalNumberValidator,
  gas: amorphNaturalNumberValidator,
  gasPrice: amorphNaturalNumberValidator,
  data: 'Amorph',
  nonce: amorphNaturalNumberValidator
}
