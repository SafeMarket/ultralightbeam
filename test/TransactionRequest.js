const TransactionRequest = require('../lib/TransactionRequest')
const accounts = require('./accounts')
const ultralightbeam = require('./ultralightbeam')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

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
      data: Amorph.from(amorphHex.unprefixed, '01'),
      nonce: Amorph.from(amorphHex.unprefixed, '01')
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
        from: Amorph.from(amorphHex.unprefixed, '01')
      }).send()
    }).should.throw(Error)
  })

  it('should throw validation error with bad to', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest(ultralightbeam, {
        to: Amorph.from(amorphHex.unprefixed, '01')
      })
    }).should.throw(Error)
  })

  it('should throw validation error with bogus field', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest(ultralightbeam, {
        bogus: Amorph.from(amorphHex.unprefixed, '01')
      })
    }).should.throw(Error)
  })

})
