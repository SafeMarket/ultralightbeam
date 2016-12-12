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
const blockFlags = require('../lib/blockFlags')


describe('eth', () => {

  let accounts
  let blockNumber
  const balances = []
  let contractAddress1
  let contractAddress2
  let block1ByNumber
  let block1ByHash
  let block1ByFlag

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
          .eth.getBalance(account, blockFlags.latest)
          .then((balance) => {
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
        if (index > 0) {
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
          new Amorph(positionArray, 'array'),
          blockFlags.latest
        )
        .should.eventually.amorphTo('number').equal(1234)
    })

    it('should get pos1[msg.sender] ', () => {
      const keyArray = []
        .concat(new Array(12).fill(0))
        .concat(ultralightbeam.defaults.from.to('array'))
        .concat(new Array(31).fill(0))
        .concat([1])
      const key = new Amorph(keyArray, 'array')
      const positionHex = web3Sha3(key.to('hex.prefixed'), { encoding: 'hex' })
      const position = new Amorph(positionHex, 'hex')

      return ultralightbeam
        .eth.getStorageAt(storageContract.address, position, blockFlags.latest)
        .should.eventually.amorphTo('number').equal(5678)
    })

  })

  describe('getTransactionCount', () => {

    it('account0 should be instanceof Amorph', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[0],
          blockFlags.latest
        )
        .should.eventually.be.instanceof(Amorph)
    })

    it('account0 should be greater than zero', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[0],
          blockFlags.latest
        )
        .should.eventually.amorphTo('number').be.greaterThan(0)
    })

    it('account1 should be zero', () => {
      return ultralightbeam.eth.getTransactionCount(
          accounts[1],
          blockFlags.latest
        )
        .should.eventually.amorphTo('number').equal(0)
    })

  })

  describe('getCode', () => {
    it('should be zeros for account0', () => {
      return ultralightbeam.eth.getCode(
        accounts[0],
        blockFlags.latest
      ).should.eventually.amorphTo('number').equal(0)
    })

    it('should not be empty for storageContract.address ', () => {
      return ultralightbeam
        .eth.getCode(storageContract.address, blockFlags.latest)
        .should.eventually.amorphEqual(storageContract.runtimeBytecode)
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

  describe('sendTransaction', () => {

    it('should send 1 wei from account0 to account1', () => {
      return ultralightbeam.eth.sendTransaction(new TransactionRequest({
        from: accounts[0],
        to: accounts[1],
        value: new Amorph(1, 'number')
      })).should.be.fulfilled
    })

    it('should wait for blockPoller', () => {
      return ultralightbeam.blockPoller.promise
    })

    it('account1 balance should have increased by 1', () => {
      return ultralightbeam.eth.getBalance(
        accounts[1],
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

      return ultralightbeam.eth.sendTransaction(transactionRequest).then((
        transactionHash
      ) => {
        return ultralightbeam.blockPoller.promise.then(() => {
          // eslint-disable-next-line max-len
          return ultralightbeam.eth.getTransactionReceipt(transactionHash).then((
            transactionReceipt
          ) => {
            contractAddress1 = transactionReceipt.contractAddress
            return transactionReceipt
          })
        })
      }).should.be.fulfilled

    })

    it('contract address code should be correct', () => {
      return ultralightbeam.eth.getCode(
        contractAddress1,
        blockFlags.latest
      ).should.eventually.amorphEqual(storageContract.runtimeBytecode)
    })

  })

  describe('sendRawTransaction', () => {

    it('should deploy contract', () => {
      const transactionRequest = new TransactionRequest({
        data: storageContract.bytecode,
        gas: new Amorph(3141592, 'number')
      })
      const signedRawTransaction = transactionRequest.sign(
        personas[0].privateKey
      )

      return ultralightbeam.eth.sendRawTransaction(signedRawTransaction).then((
        transactionHash
      ) => {
        return ultralightbeam.blockPoller.promise.then(() => {
          return ultralightbeam.eth.getTransactionReceipt(
            transactionHash
          ).then((transactionReceipt) => {
            contractAddress1 = transactionReceipt.contractAddress
            return transactionReceipt
          })
        })
      }).should.be.fulfilled
    })

    it('contract address code should be correct', () => {
      if (!contractAddress2) return
      return ultralightbeam.eth.getCode(contractAddress2, blockFlags.latest)
        .should.eventually.amorphEqual(storageContract.runtimeBytecode)
    })

  })

  describe('call', () => {

    it('should get correct result', () => {
      const manifest = storageContract.solbuilder.get(
        contractAddress1, 'pos0()'
      )
      return ultralightbeam.eth.call.apply(
          ultralightbeam,
          manifest.inputs
        ).should.eventually.amorphTo('number').equal(1234)
    })

  })

  describe('estimateGas', () => {

    it('should return 21000 for a simple transfer', () => {
      const transactionRequest = new TransactionRequest({
        from: accounts[0],
        to: accounts[1],
        value: new Amorph(1, 'number')
      })
      return ultralightbeam.eth.estimateGas(
        transactionRequest,
        blockFlags.latest
      ).should.eventually.amorphTo('number').equal(21000)
    })

  })

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
      ).then((block1) => {
        block1ByNumber = block1
      })
    })

    it('block1ByNumber should be instance of Block', () => {
      return block1ByNumber.should.be.instanceof(Block)
    })

  })

  describe('getBlockByHash', () => {

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getBlockByHash(
        block1ByNumber.hash, true
      ).then((block1) => {
        block1ByHash = block1
      })
    })

    it('block1ByHash should be instance of Block', () => {
      return block1ByHash.should.be.instanceof(Block)
    })

    it('block1ByNumber should deep equal block1ByHash', () => {
      return block1ByNumber.should.deep.equal(block1ByHash)
    })

  })

  describe('getBlockByFlag', () => {

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getBlockByFlag(
        blockFlags.latest, true
      ).then((block1) => {
        block1ByFlag = block1
      })
    })

    it('block1ByFlag should be instance of Block', () => {
      return block1ByFlag.should.be.instanceof(Block)
    })

    it('block1ByFlag should deep equal block1ByHash', () => {
      return block1ByFlag.should.deep.equal(block1ByHash)
    })

  })

  describe('getTransactionByHash', () => {

    let transaction

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getTransactionByHash(
        block1ByNumber.transactions[0].hash
      ).then((_transaction) => {
        transaction = _transaction
      })
    })

    it('transaction should be instance of Transaction', () => {
      return transaction.should.be.instanceof(Transaction)
    })

    it('transaction hash should be correct', () => {
      return transaction.hash.should.amorphEqual(
        block1ByNumber.transactions[0].hash
      )
    })

  })

  describe('getTransactionReceipt', () => {

    let transactionReceipt

    it('should be fulfilled', () => {
      return ultralightbeam.eth.getTransactionReceipt(
        block1ByNumber.transactions[0].hash
      ).then((_transactionReceipt) => {
        transactionReceipt = _transactionReceipt
      })
    })

    it('transaction should be instance of TransactionReceipt', () => {
      return transactionReceipt.should.be.instanceof(TransactionReceipt)
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
      solidityOutput.code.should.amorphEqual(storageContract.bytecode)
    })

    it('abi should be correct', () => {
      solidityOutput.info.abiDefinition.should.deep.equal(storageContract.abi)
    })

  })

})
