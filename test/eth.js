const Q = require('q')
const ultralightbeam = require('./ultralightbeam')
const storageContractInfo = require('./storageContractInfo')
const storageContractPromise = require('./storageContract')
const web3Sha3 = require('web3/lib/utils/sha3')
const TransactionRequest = require('../lib/TransactionRequest')
const Transaction = require('../lib/Transaction')
const TransactionReceipt = require('../lib/TransactionReceipt')
const accounts = require('./accounts')
const account = require('./account')
const Block = require('../lib/Block')
const blockFlags = require('../lib/blockFlags')
const Amorph = require('amorph')
const amorphArray = require('amorph-array')
const amorphHex = require('amorph-hex')
const amorphNumber = require('amorph-number')

describe('eth', () => {

  let blockNumber
  const balances = []
  let blockByNumber
  let blockByHash
  let blockByFlag

  describe('getBalance', () => {

    it('should be fulfilled', () => {
      return Q.all(accounts.map((_account) => {
        return ultralightbeam.eth.getBalance(_account.address)
      })).then((_balances) => {
        balances.push(..._balances)
      })
    })

    it('should be array of 10 Amorphs', () => {
      balances.should.be.instanceof(Array)
      balances.should.have.length(10)
      balances.forEach((balance) => {
        balance.should.be.instanceof(Amorph)
        balance.to(amorphNumber.unsigned).should.be.gt(0)
      })
    })

  })

  describe('getStorageAt', () => {

    let storageContract
    before(() => {
      return storageContractPromise.then((_storageContract) => {
        storageContract = _storageContract
      })
    })

    it('should get pos0 ', () => {
      const positionArray = new Array(32).fill(0)
      return ultralightbeam
        .eth.getStorageAt(
          storageContract.address,
          Amorph.from(amorphArray, positionArray)
        )
        .should.eventually.amorphTo(amorphNumber.unsigned).equal(1234)
    })

    it('should get pos1[msg.sender] ', () => {
      const keyArray = []
        .concat(new Array(12).fill(0))
        .concat(account.address.to(amorphArray))
        .concat(new Array(31).fill(0))
        .concat([1])
      const key = Amorph.from(amorphArray, keyArray)
      const positionHex = web3Sha3(key.to(amorphHex.prefixed), { encoding: 'hex' })
      const position = Amorph.from(amorphHex.unprefixed, positionHex)

      return ultralightbeam
        .eth.getStorageAt(storageContract.address, position)
        .should.eventually.amorphTo(amorphNumber.unsigned).equal(5678)
    })

  })

  describe('getTransactionCount', () => {

    it('account0 should instance of Amorph', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[0].address
        )
        .should.eventually.be.instanceof(Amorph)
    })

    it('account0 should be greater than zero', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[0].address
        )
        .should.eventually.amorphTo(amorphNumber.unsigned).be.greaterThan(0)
    })

    it('account9 should be zero', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[9].address
        )
        .should.eventually.amorphTo(amorphNumber.unsigned).equal(0)
    })

  })

  describe('getCode', () => {

    let storageContract
    before(() => {
      return storageContractPromise.then((_storageContract) => {
        storageContract = _storageContract
      })
    })

    it('should be empty for account0', () => {
      return ultralightbeam.eth.getCode(
        accounts[0].address
      ).should.eventually.amorphTo(amorphArray).have.length(0)
    })

    it('should not be empty for storageContract.address ', () => {
      return ultralightbeam
        .eth.getCode(storageContract.address)
        .should.eventually.amorphEqual(storageContractInfo.runcode)
    })
  })

  describe('getCompilers', () => {
    it('should deep equal ["solidity"]', () => {
      return ultralightbeam.eth.getCompilers().should.eventually.deep.equal(
        ['solidity']
      )
    })
  })

  describe('getGasPrice', () => {

    it('should be 2 Szabo', () => {
      const twoSzabo = 20000000000
      return ultralightbeam.eth.getGasPrice().should.eventually.amorphTo(amorphNumber.unsigned).equal(twoSzabo)
    })

  })

  describe('estimateGas', () => {

    it('should return 21000 for a simple transfer', () => {
      const transactionRequest = new TransactionRequest(ultralightbeam, {
        from: account,
        to: accounts[1].address,
        value: Amorph.from(amorphNumber.unsigned, 1)
      })
      return ultralightbeam.eth.estimateGas(
        transactionRequest
      ).should.eventually.amorphTo(amorphNumber.unsigned).equal(21000)
    })

  })

  // must be called here so there are transaction hashes to test
  require('./sendTransaction')

  describe('getBlockNumber', () => {

    it('should be fulfilled', () => {

      return ultralightbeam
        .eth.getBlockNumber()
        .then((_blockNumber) => {
          blockNumber = _blockNumber
        })
        .should.be.fulfilled

    })

    it('should be an integer', () => {
      blockNumber.should.be.instanceof(Amorph)
      const remainder = blockNumber.to(amorphNumber.unsigned) % 1
      remainder.should.equal(0)
    })

  })

  describe('getBlockByNumber', () => {

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getBlockByNumber(
        blockNumber,
        true
      ).then((block) => {
        blockByNumber = block
      })
    })

    it('blockByNumber should be instance of Block', () => {
      return blockByNumber.should.be.instanceof(Block)
    })

  })

  describe('getBlockByHash', () => {

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getBlockByHash(
        blockByNumber.hash, true
      ).then((block) => {
        blockByHash = block
      })
    })

    it('blockByHash should be instance of Block', () => {
      blockByHash.should.be.instanceof(Block)
    })

    it('blockByNumber should have same keys as blockByHash', () => {
      blockByNumber.should.have.keys(Object.keys(blockByHash))
      blockByHash.should.have.keys(Object.keys(blockByNumber))
    })

    after(() => {
      Object.keys(blockByHash).forEach((key) => {
        it(`blockByNumber.${key} should amorph equal blockByHash.${key}`, () => {
          blockNumber[key].should.amorphEqual(blockByHash[key])
        })
      })
    })

  })

  describe('getBlockByFlag', () => {

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getBlockByFlag(
        blockFlags.latest, true
      ).then((block) => {
        blockByFlag = block
      })
    })

    it('blockByFlag should be instance of Block', () => {
      return blockByFlag.should.be.instanceof(Block)
    })

    it('blockByFlag should deep equal blockByHash', () => {
      return blockByFlag.should.deep.equal(blockByHash)
    })

  })

  describe('getTransactionByHash', () => {

    let transaction

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getTransactionByHash(
        blockByNumber.transactions[0].hash
      ).then((_transaction) => {
        transaction = _transaction
      })
    })

    it('transaction should be instance of Transaction', () => {
      return transaction.should.be.instanceof(Transaction)
    })

    it('transaction hash should be correct', () => {
      return transaction.hash.should.amorphEqual(
        blockByNumber.transactions[0].hash
      )
    })

  })

  describe('getTransactionReceipt', () => {

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getTransactionReceipt(
        blockByNumber.transactions[0].hash
      ).should.eventually.be.instanceOf(TransactionReceipt)
    })

  })

})
