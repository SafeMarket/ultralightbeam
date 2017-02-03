const Amorph = require('../lib/Amorph')
const Q = require('q')
const ultralightbeam = require('./ultralightbeam')
const storageContract = require('./storageContract')
const web3Sha3 = require('web3/lib/utils/sha3')
const TransactionRequest = require('../lib/TransactionRequest')
const Transaction = require('../lib/Transaction')
const TransactionReceipt = require('../lib/TransactionReceipt')
const personas = require('../modules/personas')
const Block = require('../lib/Block')
const SolidityOutput = require('../lib/SolidityOutput')
const persona = require('../modules/persona')
const blockFlags = require('../lib/blockFlags')

describe('eth', () => {

  let accounts
  let blockNumber
  const balances = []
  let contractAddress1
  let blockByNumber
  let blockByHash
  let blockByFlag

  describe('getAccounts', () => {

    it('should be fulfilled', () => {

      return ultralightbeam
        .eth.getAccounts()
        .then((_accounts) => {
          accounts = _accounts
        })
        .should.be.fulfilled

    })

    it('should be array of 10 Amorphs', () => {
      accounts.should.be.instanceof(Array)
      accounts.should.have.length(10)
      accounts.forEach((account, index) => {
        account.should.be.instanceof(Amorph)
        account.to('hex.prefixed').should.be.an.address()
        account.to('hex.prefixed').should.equal(
          personas[index].address.to('hex.prefixed')
        )
      })
    })

  })

  describe('getBalance', () => {

    it('should be fulfilled', () => {

      const promises = []

      accounts.forEach((account) => {
        const promise = ultralightbeam
          .eth.getBalance(account).then((balance) => {
            balances.push(balance)
          })
        promises.push(promise)
      })

      return Q.all(promises)

    })

    it('should be array of 10 Amorphs', () => {
      balances.should.be.instanceof(Array)
      balances.should.have.length(10)
      balances.forEach((balance, index) => {
        balance.should.be.instanceof(Amorph)
        balance.to('number').should.be.gt(0)
        if (index > 1) {
          balance.to('number').should.equal(
            personas[index].balance.to('number')
          )
        }
      })
    })

  })

  describe('getStorageAt', () => {

    it('should get pos0 ', () => {
      const positionArray = new Array(32).fill(0)
      return ultralightbeam
        .eth.getStorageAt(
          storageContract.address,
          new Amorph(positionArray, 'array')
        )
        .should.eventually.amorphTo('number').equal(1234)
    })

    it('should get pos1[msg.sender] ', () => {
      const keyArray = []
        .concat(new Array(12).fill(0))
        .concat(persona.address.to('array'))
        .concat(new Array(31).fill(0))
        .concat([1])
      const key = new Amorph(keyArray, 'array')
      const positionHex = web3Sha3(key.to('hex.prefixed'), { encoding: 'hex' })
      const position = new Amorph(positionHex, 'hex')

      return ultralightbeam
        .eth.getStorageAt(storageContract.address, position)
        .should.eventually.amorphTo('number').equal(5678)
    })

  })

  describe('getTransactionCount', () => {

    it('account0 should be instanceof Amorph', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[0]
        )
        .should.eventually.be.instanceof(Amorph)
    })

    it('account0 should be greater than zero', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[0]
        )
        .should.eventually.amorphTo('number').be.greaterThan(0)
    })

    it('account1 should be zero', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[1]
        )
        .should.eventually.amorphTo('number').equal(0)
    })

  })

  describe('getCode', () => {
    it('should be zeros for account0', () => {
      return ultralightbeam.eth.getCode(
        accounts[0]
      ).should.eventually.amorphTo('number').equal(0)
    })

    it('should not be empty for storageContract.address ', () => {
      return ultralightbeam
        .eth.getCode(storageContract.address)
        .should.eventually.amorphEqual(storageContract.runcode)
    })
  })

  describe('getCompilers', () => {
    it('should deep equal ["solidity"]', () => {
      return ultralightbeam.eth.getCompilers().should.eventually.deep.equal(
        ['solidity']
      )
    })
  })

  describe('sign', () => {

    const dataArray = new Array(32).fill(1)
    const data = new Amorph(dataArray, 'array')

    let signedData

    it('data should be fulfilled', () => {
      return ultralightbeam.eth.sign(accounts[0], data).then((_signedData) => {
        signedData = _signedData
      }).should.be.fulfilled
    })

    it('should be 32 bytes long', () => {
      signedData.to('array').should.have.length(65)
    })

    it('should NOT be zero', () => {
      signedData.to('number').should.not.equal(0)
    })

  })

  describe('getGasPrice', () => {

    it('should be 2 Szabo', () => {
      const twoSzabo = 20000000000
      return ultralightbeam.eth.getGasPrice().should.eventually.amorphTo('number').equal(twoSzabo)
    })

  })

  describe('estimateGas', () => {

    it('should return 21000 for a simple transfer', () => {
      const transactionRequest = new TransactionRequest({
        from: persona,
        to: accounts[1],
        value: new Amorph(1, 'number')
      })
      return ultralightbeam.eth.estimateGas(
        transactionRequest
      ).should.eventually.amorphTo('number').equal(21000)
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
      const remainder = blockNumber.to('number') % 1
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
      return blockByHash.should.be.instanceof(Block)
    })

    it('blockByNumber should deep equal blockByHash', () => {
      return blockByNumber.should.deep.equal(blockByHash)
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

  describe('compileSolidity', () => {

    let solidityOutput

    it('should compile storageContract', () => {
      return ultralightbeam.eth.compileSolidity(
        storageContract.sol
      ).then((_solidityOutput) => {
        solidityOutput = _solidityOutput
      }).should.be.fulfilled
    })

    it('solidityOutput should be instanceof SolidityOutput', () => {
      solidityOutput.should.be.instanceof(SolidityOutput)
    })

    it('code should be correct', () => {
      solidityOutput.code.should.amorphEqual(storageContract.code)
    })

    it('abi should be correct', () => {
      solidityOutput.info.abiDefinition.should.deep.equal(storageContract.abi)
    })

  })

})
