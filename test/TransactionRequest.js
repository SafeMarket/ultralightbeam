const Amorph = require('../lib/Amorph')
const TransactionRequest = require('../lib/TransactionRequest')
const accounts = require('./accounts')
const ArgumentInstanceError = require('arguguard/errors/user/ArgumentInstance')
const addressValidator = require('../lib/validators/address')
const transactionRequestFieldValidator = require('../lib/validators/transactionRequestField')
const ultralightbeam = require('./ultralightbeam')

describe('TransactionRequest', () => {

  let transactionRequest1
  let transactionRequest2

  it('should instantiate with no values', () => {
    transactionRequest1 = new TransactionRequest(ultralightbeam, {})
  })

  it('.toPojo should be blank pojo', () => {
    Object.keys(transactionRequest1.toPojo()).should.have.length(1) // sets default account
  })

  it('should instantiate with complete arguments', () => {
    transactionRequest2 = new TransactionRequest(ultralightbeam, {
      from: accounts[0],
      to: accounts[1].address,
      data: new Amorph('01', 'hex'),
      nonce: new Amorph('01', 'hex')
    })
  })

  it('should .toRawSigned()', () => {
    transactionRequest2.toRawSigned().should.be.instanceof(Amorph)
  })

  it('.toPojo should have keys [from, to, data] ', () => {
    transactionRequest2.toPojo().should.have.all.keys('from', 'to', 'data', 'nonce')
  })

  it('should throw validation error with bad from', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest(ultralightbeam, {
        from: new Amorph('01', 'hex')
      }).send()
    }).should.throw(ArgumentInstanceError)
  })

  it('should throw validation error with bad to', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest(ultralightbeam, {
        to: new Amorph('01', 'hex')
      })
    }).should.throw(addressValidator.Error)
  })

  it('should throw validation error with bogus field', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest(ultralightbeam, {
        bogus: new Amorph('01', 'hex')
      })
    }).should.throw(transactionRequestFieldValidator.Error)
  })

})
