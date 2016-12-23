const ultralightbeam = require('./ultralightbeam')
const TransactionRequest = require('../lib/TransactionRequest')
const blockFlags = require('../lib/blockFlags')
const storageContract = require('./storageContract')
const personas = require('../modules/personas')
const Amorph = require('Amorph')
const Q = require('q')
const TransactionReceipt = require('../lib/TransactionReceipt')

describe('sendTransaction', () => {

  const balances = []
  let contractAddress1

  it('should get balances', () => {

    const promises = []

    personas.forEach((persona) => {
      const promise = ultralightbeam
        .eth.getBalance(persona.address, blockFlags.latest)
        .then((balance) => {
          balances.push(balance)
        })
      promises.push(promise)
    })

    return Q.all(promises)

  })

  it('should send 1 wei from account0 to account1', () => {
    return ultralightbeam.sendTransaction(new TransactionRequest({
      from: personas[0],
      to: personas[1].address,
      value: new Amorph(1, 'number')
    })).should.eventually.be.instanceOf(TransactionReceipt)
  })

  it('account1 balance should have increased by 1', () => {
    return ultralightbeam.eth.getBalance(
      personas[1].address,
      blockFlags.latest
    )
    .should.eventually.amorphTo('number').equal(
      balances[1].to('number') + 1
    )
  })


  it('should deploy contract', () => {

    const transactionRequest = new TransactionRequest({
      data: storageContract.bytecode,
      gas: new Amorph(3141592, 'number')
    })

    return ultralightbeam.sendTransaction(transactionRequest).then((
      transactionReceipt
    ) => {
      contractAddress1 = transactionReceipt.contractAddress
      return transactionReceipt
    }).should.eventually.be.instanceof(TransactionReceipt)

  })

  it('contract address code should be correct', () => {
    return ultralightbeam.eth.getCode(
      contractAddress1,
      blockFlags.latest
    ).should.eventually.amorphEqual(storageContract.runtimeBytecode)
  })

})
