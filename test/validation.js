const ultralightbeam = require('./ultralightbeam')
const accounts = require('./accounts')
const countingNumberValidator = require('../lib/validators/countingNumber')
const ArgumentsLengthError = require('arguguard/errors/user/ArgumentsLength')
const addressValidator = require('../lib/validators/address')

describe('validation', () => {

  it('should throw ArgumentsLength', () => {
    (() => {
      ultralightbeam.eth.getBalance()
    }).should.throw(addressValidator.Error)
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
