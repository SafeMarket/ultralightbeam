const Ultralightbeam = require('../')
const ultralightbeam = require('./ultralightbeam')
const accounts = require('./accounts')
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
      ultralightbeam.eth.getBalance(accounts[0].address, 'latest')
    }).should.throw(errors.ArgumentsLengthError)
  })

  it('should throw validators.blockFlag.Error', () => {
    (() => {
      ultralightbeam.eth.getBlockByFlag(accounts[0].address, false)
    }).should.throw(blockFlagValidator.Error)
  })

})
