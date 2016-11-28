const _ = require('lodash')
const Solbuilder = require('../lib/Solbuilder')
const Amorph = require('../modules/Amorph')
const chai = require('../modules/chai')
const solquester = require('../modules/solquester')
const TransactionReceipt = require('../lib/TransactionReceipt')

const contracts = require('./contracts')

describe('solquester', () => {

  const accounts = []
  const balances = []

  describe('batches', () => {
    it('should be empty array', () => {
      solquester.batches.should.be.instanceof(Array)
      solquester.batches.should.have.length(0)
    })
  })

  describe('accounts', () => {
  
    it('should get', () => {
   
      return solquester
        .eth.getAccounts()
        .withHandler((_accounts) => {
          accounts.push.apply(accounts, _accounts)
        })
        .promise.should.be.fulfilled

    })

    it('should have added 1 batch to batches', () => {
      solquester.batches.should.have.length(1)
    })

    it('should be array of 10 Amorphs', () => {
      accounts.should.be.instanceof(Array)
      accounts.should.have.length(10)
      accounts.forEach((account) => {
        account.should.be.instanceof(Amorph)
        account.to('hex.prefixed').should.be.an.address()
      })
    })

    it('should set solquester.defaults.from to account0', () => {
      solquester.defaults.from = accounts[0]
    })

  })

  describe('balances', () => {
  
    it('should get', () => {

      accounts.forEach((account) => {
        solquester
          .eth.getBalance(account)
          .withHandler((balance) => {
            balances.push(balance)
          })
      })
   
      return solquester.batch.execution.promise.should.be.fulfilled

    })

    it('should have added 1 batch to batches', () => {
      solquester.batches.should.have.length(2)
    })

    it('should be array of 10 Amorphs', () => {
      balances.should.be.instanceof(Array)
      balances.should.have.length(10)
      balances.forEach((balance) => {
        balance.should.be.instanceof(Amorph)
        balance.to('hex.prefixed').should.not.be.zeros()
      })
    })

  })

})

describe('Simple', () => {

  let transactionHash
  let transactionReceipt
  let simpleSolbuilder
  let address

  it('should create simpleSolbuilder', () => {
    simpleBuilder = new Solbuilder(contracts.Simple.abi, contracts.Simple.bytecode)
  })


  it('should deploy', () => {
    return solquester
      .add(simpleBuilder.deploy([]))
      .withHandler((_transactionHash) => {
        transactionHash = _transactionHash
      })
      .promise.should.be.fulfilled
  })

  it('result should have transactionHash', () => {
    transactionHash.should.be.instanceof(Amorph)
  })

  it('getTransactionReceipt should be null', () => {
    return solquester.eth.getTransactionReceipt(transactionHash).promise.should.eventually.equal(null)
  })

  it('should wait a second', (done) => {
    setTimeout(done, 1000)
  })

  it('getTransactionReceipt should be instanceof TransactionReceipt', () => {
    return solquester.eth.getTransactionReceipt(transactionHash).withHandler((_transactionReciept) => {
      transactionReceipt = _transactionReciept
      address = transactionReceipt.contractAddress
    }).promise.should.eventually.be.instanceof(TransactionReceipt)
  })

  it('transactionReceipt.address should be address', () => {
    address.to('hex.prefixed').should.be.an.address()
  })

  it('getCode should deep equal runtimeBytecode', () => {
    return solquester
      .eth.getCode(address)
      .promise.should.eventually.amorphTo('hex').equal(contracts.Simple.runtimeBytecode.to('hex'))
  })

  it('var1 should be equal to 1', () => {
    return solquester
      .add(simpleBuilder.get(address, 'var1()'))
      .promise.should.eventually.amorphTo('number').equal(1)
  })

  it('var2 should be equal to 2', () => {
    return solquester
      .add(simpleBuilder.get(address, 'var2()'))
      .promise.should.eventually.amorphTo('number').equal(2)
  })

})