const Amorph = require('../modules/Amorph')
const Q = require('q')
const solc = require('solc')
const Solbuilder = require('../lib/Solbuilder')
const solquester = require('./solquester')
const web3Sha3 = require('web3/lib/utils/sha3')

describe('eth', () => {

  let accounts
  let blockNumber
  const balances = []

  describe('getAccounts', () => {
  
    it('should be fulfilled', () => {
   
      return solquester
        .eth.getAccounts()
        .withHandler((_accounts) => {
          accounts = _accounts
        })
        .promise.should.be.fulfilled

    })

    it('should be array of 10 Amorphs', () => {
      accounts.should.be.instanceof(Array)
      accounts.should.have.length(10)
      accounts.forEach((account) => {
        account.should.be.instanceof(Amorph)
        account.to('hex.prefixed').should.be.an.address()
      })
    })

  })

  describe('getBlockNumber', () => {
  
    it('should be fulfilled', () => {
   
      return solquester
        .eth.getBlockNumber()
        .withHandler((_blockNumber) => {
          blockNumber = _blockNumber
        })
        .promise.should.be.fulfilled

    })

    it('should be an integer', () => {
      blockNumber.should.be.a('number')
      const remainder = blockNumber % 1
      remainder.should.equal(0)
    })

  })

  describe('getBlockNumber', () => {

    let blockNumber
  
    it('should be fulfilled', () => {
   
      return solquester
        .eth.getBlockNumber()
        .withHandler((_blockNumber) => {
          blockNumber = _blockNumber
        })
        .promise.should.be.fulfilled

    })

    it('should be an integer', () => {
      blockNumber.should.be.a('number')
      const remainder = blockNumber % 1
      remainder.should.equal(0)
    })

  })

  describe('getBalance', () => {

    it('should be fulfilled', () => {

      const promises = []

      accounts.forEach((account) => {
        solquester
          .eth.getBalance(account)
          .withHandler((balance) => {
            balances.push(balance)
          })
        promises.push(solquester.promise)
      })

      promises.push(solquester.batch.execution.promise)
   
      return Q.all(promises)

    })

    it('should be array of 10 Amorphs greater than zero', () => {
      balances.should.be.instanceof(Array)
      balances.should.have.length(10)
      balances.forEach((balance) => {
        balance.should.be.instanceof(Amorph)
        balance.to('number').should.be.greaterThan(0)
      })
    })

  })

  describe('getStorageAt', () => {

    const storageContractSol =
      `contract Storage {
        uint pos0;
        mapping(address => uint) pos1;

        function Storage() {
            pos0 = 1234;
            pos1[msg.sender] = 5678;
        }
      }`
    const solcOutput = solc.compile(storageContractSol).contracts.Storage
    const storageSolbuilder = new Solbuilder(
      JSON.parse(solcOutput.interface),
      new Amorph(solcOutput.bytecode, 'hex')
    )
    let address

    it ('should deploy Storage contract', () => {
      return solquester
        .add(storageSolbuilder.deploy())
        .promise.then((transactionHash) => {
          return solquester
            .pollForTransactionReciept(transactionHash)
            .then((transactionReciept) => {
              address = transactionReciept.contractAddress
            })
        }, (err) => {
          return Q.reject(err)
        }).should.be.fulfilled
    })

    it ('getCode should not be empty ', () => {
      return solquester
        .eth.getCode(address)
        .promise.should.eventually.amorphTo('number').not.equal(0)
    })

    it ('should get pos0 ', () => {
      // 0 should work, but doesn't because of testrpc issue https://github.com/ethereumjs/testrpc/issues/133
      const positionArray = new Array(32).fill(0)
      return solquester
        .eth.getStorageAt(address, new Amorph(positionArray, 'array'))
        .promise.should.eventually.amorphTo('number').equal(1234)
    })

    it ('should get pos1[msg.sender] ', () => {
      const keyArray = []
        .concat(new Array(12).fill(0))
        .concat(solquester.defaults.from.to('array'))
        .concat(new Array(31).fill(0))
        .concat([1])
      const key = new Amorph(keyArray, 'array')
      const positionHexPrefixed = web3Sha3(key.to('hex.prefixed'), { encoding: 'hex' })
      const position = new Amorph(positionHexPrefixed, 'hex.prefixed')

      return solquester
        .eth.getStorageAt(address, position)
        .promise.should.eventually.amorphTo('number').equal(5678)
    })

  })


})