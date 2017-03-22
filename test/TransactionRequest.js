const Amorph = require('../lib/Amorph')
const TransactionRequest = require('../lib/TransactionRequest')
const accounts = require('./accounts')
const accountValidator = require('../lib/validators/account')
const amorphAddressValidator = require('../lib/validators/amorphAddress')
const transactionRequestFieldValidator = require(
  '../lib/validators/transactionRequestField'
)
const ultralightbeam = require('./ultralightbeam')

describe('TransactionRequest', () => {

  let transactionRequest1
  let transactionRequest2

  it('should instantiate with no arguments', () => {
    transactionRequest1 = new TransactionRequest
  })

  it('.toPojo should be blank pojo', () => {
    Object.keys(transactionRequest1.toPojo()).should.have.length(0)
  })

  it('should instantiate with complete arguments', () => {
    transactionRequest2 = new TransactionRequest(null, {
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
    }).should.throw(accountValidator.Error)
  })

  it('should throw validation error with bad tp', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest(null, {
        to: new Amorph('01', 'hex')
      })
    }).should.throw(amorphAddressValidator.Error)
  })

  it('should throw validation error with bogus field', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest(null, {
        bogus: new Amorph('01', 'hex')
      })
    }).should.throw(transactionRequestFieldValidator.Error)
  })

})
