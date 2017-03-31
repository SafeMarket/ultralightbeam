const ultralightbeam = require('./ultralightbeam')
const accounts = require('./accounts')
const countingNumberValidator = require('../lib/validators/countingNumber')
const ArgumentsLengthError = require('arguguard/errors/user/ArgumentsLength')

describe('validation', () => {

  it('should throw ArgumentsLength', () => {
    (() => {
      ultralightbeam.eth.getBalance()
    }).should.throw(ArgumentsLengthError)
  })

  it('should throw ArgumentsLength', () => {
    (() => {
      ultralightbeam.eth.getBalance(accounts[0].address, 'latest')
    }).should.throw(ArgumentsLengthError)
  })

  it('should throw countingNumberValidator.', () => {
    (() => {
      ultralightbeam.miner.start(0)
    }).should.throw(countingNumberValidator.Error)
  })

})
