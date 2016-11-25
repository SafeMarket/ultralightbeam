const glob = require('glob')
const fs = require('fs')
const solc = require('solc')
const _ = require('lodash')
const TestRPC = require('ethereumjs-testrpc')
const Solquester = require('../')
const Amorph = require('../modules/Amorph')
const chai = require('chai')

const expect = chai.expect

chai.use((chai, utils) => {
  utils.addChainableMethod(chai.Assertion.prototype, 'amorphTo', function (form) {
    this._obj = this._obj.to(form)
  });
})
chai.use(require('chai-as-promised'))
chai.should()

const sources = {}
const contracts = {}

const solquester = new Solquester(TestRPC.provider({
  blocktime: 1
}))

describe('contracts', () => {

  it('should get globbed', () => {
    glob.sync('contracts/**/*.sol').forEach((filePath) => {
      const fileName = _.last(filePath.split('/'))
      sources[fileName] = fs.readFileSync(filePath, 'utf-8')
    })
    
  })

  it('should get solc', () => {
   const solcOutput = solc.compile({ sources })
   if (solcOutput.errors && solcOutput.errors.length > 0) {
    throw new Error(solcOutput.errors[0])
   }
   _.forEach(solcOutput.contracts, (_contract, name) => {
    contracts[name] = {
      abi: JSON.parse(_contract.interface),
      bytecode: new Amorph(_contract.bytecode, 'hex'),
      runtimeBytecode: new Amorph(_contract.runtimeBytecode, 'hex')
    }
   })
  })

})

describe('Solquester', () => {

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
        .getAccounts()
        .withHandler((_accounts) => {
          accounts.push.apply(accounts, _accounts)
        })
        .batch.execution.promise.should.be.fulfilled

    })

    it('should have added 1 batch to batches', () => {
      solquester.batches.should.have.length(1)
    })

    it('should be array of 10 Amorphs', () => {
      accounts.should.be.instanceof(Array)
      accounts.should.have.length(10)
      accounts.forEach((account) => {
        account.should.be.instanceof(Amorph)
      })
    })

    it('should set solquester.account to account0', () => {
      solquester.account = accounts[0]
    })

  })

  describe('balances', () => {
  
    it('should get', () => {

      accounts.forEach((account) => {
        solquester
          .getBalance(account)
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
      })
    })

  })

})

describe('Simple', () => {

  let transactionHash
  let transactionReceipt

  it('should deploy', () => {
    return solquester
      .deploy(contracts.Simple.abi, contracts.Simple.bytecode, [])
      .withHandler((_transactionHash) => {
        transactionHash = _transactionHash
      })
      .promise.should.be.fulfilled
  })

  it('result should have transactionHash', () => {
    transactionHash.should.be.instanceof(Amorph)
  })

  it('getTransactionReceipt should be null', () => {
    return solquester.getTransactionReceipt(transactionHash).promise.should.eventually.equal(null)
  })

  it('should wait a second', (done) => {
    setTimeout(done, 1000)
  })

  it('getTransactionReceipt should be instanceof TransactionReceipt', () => {
    return solquester.getTransactionReceipt(transactionHash).withHandler((_transactionReciept) => {
      transactionReceipt = _transactionReciept
    }).promise.should.eventually.be.instanceof(Solquester.TransactionReceipt)
  })

  it('getCode should deep equal runtimeBytecode', () => {
    return solquester
      .getCode(transactionReceipt.contractAddress)
      .promise.should.eventually.amorphTo('hex').equal(contracts.Simple.runtimeBytecode.to('hex'))
  })

})