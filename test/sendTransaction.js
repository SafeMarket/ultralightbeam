const ultralightbeam = require('./ultralightbeam')
const TransactionRequest = require('../lib/TransactionRequest')
const blockFlags = require('../lib/blockFlags')
const storageContract = require('./storageContract')
const personas = require('../modules/personas')
const Amorph = require('Amorph')
const Q = require('q')
const Transaction = require('../lib/Transaction')
const TransactionReceipt = require('../lib/TransactionReceipt')
const TransactionMonitor = require('../lib/TransactionMonitor')

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

  let transactionMonitor
  let transactionHash

  it('should send 1 wei from account0 to account1', () => {
    transactionMonitor = ultralightbeam.sendTransaction(new TransactionRequest({
      from: personas[0],
      to: personas[1].address,
      value: new Amorph(1, 'number')
    }))
  })

  it('transactionMonitor should be instance of TransactionMonitor', () => {
    transactionMonitor.should.be.instanceOf(TransactionMonitor)
  })

  it('transactionHashPromise should be fulfilled', () => {
    return transactionMonitor.transactionHashPromise.then((_transactionHash) => {
      transactionHash = _transactionHash
    }).should.be.fulfilled
  })

  it('transactionHash should be an Amorph', () => {
    transactionHash.should.be.instanceOf(Amorph)
  })

  it('transactionHash should be 32 bytes long', () => {
    transactionHash.to('array').should.have.length(32)
  })

  it('transactionPromise should eventually return a Transaction', () => {
    return transactionMonitor.transactionPromise.should.eventually.be.instanceOf(Transaction)
  })

  it('getTransactionReceipt() should eventually return a transactionReceipt', () => {
    return transactionMonitor.getTransactionReceipt().should.eventually.be.instanceOf(
      TransactionReceipt
    )
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

    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      contractAddress1 = transactionReceipt.contractAddress
    }).should.be.fulfilled

  })

  it('contract address code should be correct', () => {
    return ultralightbeam.eth.getCode(
      contractAddress1,
      blockFlags.latest
    ).should.eventually.amorphEqual(storageContract.runtimeBytecode)
  })

})
