const Ultralightbeam = require('../')
const ultralightbeam = require('./ultralightbeam')
const personas = require('../modules/personas')

describe('validation', () => {

  it('should throw ArgumentsLengthError', () => {
    (function(){
      ultralightbeam.eth.getBalance()
    }).should.throw(Ultralightbeam.errors.ArgumentsLengthError)
  })

  it('should throw ArgumentsLengthError', () => {
    (function(){
      ultralightbeam.eth.getBalance(personas[0].address)
    }).should.throw(Ultralightbeam.errors.ArgumentsLengthError)
  })

  it('should throw validators.BlockFlag.Error', () => {
    (function(){
      ultralightbeam.eth.getBalance(personas[0].address, {})
    }).should.throw(Ultralightbeam.validators.BlockFlag.Error)
  })

})