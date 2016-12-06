const ultralightbeam = require('./ultralightbeam')
const TransactionRequest = require('../lib/TransactionRequest')
const personas = require('../modules/personas')
const Amorph = require('../lib/Amorph')

describe('rejection', () => {

  let batch

  it ('should make 3 exeuctions', () => {

    ultralightbeam.eth.sendTransaction(new TransactionRequest({
      from: personas[0].address,
      to: personas[1].address
    }))

    ultralightbeam.eth.sendTransaction(new TransactionRequest({
      from: personas[0].address,
      to: personas[1].address,
      gas: new Amorph(999999999999999, 'number')
    }))

    ultralightbeam.eth.sendTransaction(new TransactionRequest({
      from: personas[0].address,
      to: personas[1].address
    }))

    batch = ultralightbeam.batch
  })

  it ('batch.execution should be rejected', () => {
    return batch.execution.promise.should.be.rejected
  })

  it ('batch.executions[0] should be fulfilled', () => {
    return batch.executions[0].promise.should.be.fulfilled
  })

  it ('batch.executions[1] should be rejected', () => {
    return batch.executions[1].promise.should.be.rejected
  })

  it ('batch.executions[2] should be fulfilled', () => {
    return batch.executions[2].promise.should.be.fulfilled
  })

})