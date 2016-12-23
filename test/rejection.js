const ultralightbeam = require('./ultralightbeam')
const TransactionRequest = require('../lib/TransactionRequest')
const personas = require('../modules/personas')
const Amorph = require('../lib/Amorph')

describe('rejection', () => {

  let batch

  it('should make 3 exeuctions', () => {

    ultralightbeam.sendTransaction(new TransactionRequest({
      from: personas[0],
      to: personas[1].address
    }))

    ultralightbeam.sendTransaction(new TransactionRequest({
      from: personas[0],
      to: personas[1].address,
      gas: new Amorph(9999999999999999, 'number')
    }))

    ultralightbeam.sendTransaction(new TransactionRequest({
      from: personas[0],
      to: personas[1].address
    }))

    batch = ultralightbeam.batch
  })

  it('batch should be rejected', () => {
    return batch.deferred.promise.should.be.rejected
  })

  it('batch.parts[0] should be fulfilled', () => {
    return batch.parts[0].deferred.promise.should.be.fulfilled
  })

  it('batch.parts[1] should be rejected', () => {
    return batch.parts[1].deferred.promise.should.be.rejected
  })

  it('batch.parts[2] should be fulfilled', () => {
    return batch.parts[2].deferred.promise.should.be.fulfilled
  })

})
