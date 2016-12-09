const Ultralightbeam = require('../')
const ultralightbeam = require('./ultralightbeam')
const personas = require('../modules/personas')
const errors = require('../lib/errors')
const blockFlagValidator = require('../lib/validators/blockFlag')

describe('validation', () => {

  it('should throw ArgumentsLengthError', () => {
    (() => {
      ultralightbeam.eth.getBalance()
    }).should.throw(errors.ArgumentsLengthError)
  })

  it('should throw ArgumentsLengthError', () => {
    (() => {
      ultralightbeam.eth.getBalance(personas[0].address)
    }).should.throw(errors.ArgumentsLengthError)
  })

  it('should throw validators.blockFlag.Error', () => {
    (() => {
      ultralightbeam.eth.getBalance(personas[0].address, {})
    }).should.throw(blockFlagValidator.Error)
  })

})
