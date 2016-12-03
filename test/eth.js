const Amorph = require('../modules/Amorph')
const Q = require('q')
const solquester = require('./solquester')
const storageContract = require('./storageContract')
const web3Sha3 = require('web3/lib/utils/sha3')
const TransactionRequest = require('../lib/TransactionRequest')
const Transaction = require('../lib/Transaction')
const TransactionReceipt = require('../lib/TransactionReceipt')
const personas = require('../modules/personas')
const Block = require('../lib/Block')

describe('eth', () => {

  let accounts
  let blockNumber
  const balances = []
  let contractAddress1
  let contractAddress2
  let block1ByNumber
  let block1ByHash

  describe('getAccounts', () => {
  
    it('should be fulfilled', () => {
   
      return solquester
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
        account.to('hex.prefixed').should.equal(personas[index].address.to('hex.prefixed'))
      })
    })

  })

  describe('getBlockNumber', () => {
  
    it('should be fulfilled', () => {
   
      return solquester
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

  describe('getBalance', () => {

    it('should be fulfilled', () => {

      const promises = []

      accounts.forEach((account) => {
        const promise = solquester
          .eth.getBalance(account)
          .then((balance) => {
            balances.push(balance)
          })
        promises.push(promise)
      })

      promises.push(solquester.batch.execution.promise)
   
      return Q.all(promises)

    })

    it('should be array of 10 Amorphs', () => {
      balances.should.be.instanceof(Array)
      balances.should.have.length(10)
      balances.forEach((balance, index) => {
        balance.should.be.instanceof(Amorph)
        balance.to('number').should.be.gt(0)
        if (index > 0) {
          balance.to('number').should.equal(personas[index].balance.to('number'))
        }
      })
    })

  })

  describe('getStorageAt', () => {

    it('should get pos0 ', () => {
      // 0 should work, but doesn't because of testrpc issue https://github.com/ethereumjs/testrpc/issues/133
      const positionArray = new Array(32).fill(0)
      return solquester
        .eth.getStorageAt(storageContract.address, new Amorph(positionArray, 'array'))
        .should.eventually.amorphTo('number').equal(1234)
    })

    it('should get pos1[msg.sender] ', () => {
      const keyArray = []
        .concat(new Array(12).fill(0))
        .concat(solquester.defaults.from.to('array'))
        .concat(new Array(31).fill(0))
        .concat([1])
      const key = new Amorph(keyArray, 'array')
      const positionHex = web3Sha3(key.to('hex.prefixed'), { encoding: 'hex' })
      const position = new Amorph(positionHex, 'hex')

      return solquester
        .eth.getStorageAt(storageContract.address, position)
        .should.eventually.amorphTo('number').equal(5678)
    })

  })

  describe('getTransactionCount', () => {

    it('account0 should be instanceof Amorph', () => {
      return solquester.eth.getTransactionCount(accounts[0]).should.eventually.be.instanceof(Amorph)
    })

    it('account0 should be greater than zero', () => {
      return solquester.eth.getTransactionCount(accounts[0]).should.eventually.amorphTo('number').be.greaterThan(0)
    })

    it('account1 should be zero', () => {
      return solquester.eth.getTransactionCount(accounts[1]).should.eventually.amorphTo('number').equal(0)
    })

  })

  describe('getCode', () => {
    it('should be zeros for account0', () => {
      return solquester.eth.getCode(accounts[0]).should.eventually.amorphTo('number').equal(0)
    })

    it('should not be empty for storageContract.address ', () => {
      return solquester
        .eth.getCode(storageContract.address)
        .should.eventually.amorphEqual(storageContract.runtimeBytecode)
    })
  })

  describe('getCompilers', () => {
    it('should deep equal ["solidity"]', () => {
      return solquester.eth.getCompilers(accounts[0]).should.eventually.deep.equal(['solidity'])
    })
  })

  describe('sign', () => {

    const dataArray = new Array(32).fill(1)
    const data = new Amorph(dataArray, 'array')

    let signedData

    it('data should be fulfilled', () => {
      return solquester.eth.sign(accounts[0], data).then((_signedData) => {
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
      const transactionRequest = new TransactionRequest({
        from: accounts[0],
        to: accounts[1],
        value: new Amorph(1, 'number')
      })
      return solquester.eth.sendTransaction(transactionRequest).should.eventually.be.fulfilled
    })

    it('account0 balance should have dropped by 1', () => {
      return solquester.eth.getBalance(accounts[0]).should.eventually.amorphTo('number').equal(balances[0].to('number') - 1)
    })

    it('account1 balance should have increased by 1', () => {
      return solquester.eth.getBalance(accounts[1]).should.eventually.amorphTo('number').equal(balances[1].to('number') + 1)
    })


    it('should deploy contract', () => {

      const transactionRequest = new TransactionRequest({
        data: storageContract.bytecode,
        gasLimit: new Amorph(3141592, 'number')
      })

      return solquester.eth.sendTransaction(transactionRequest).then((transactionHash) => {
        return solquester
          .pollForTransactionReceipt(transactionHash)
          .then((transactionReceipt) => {
            contractAddress1 = transactionReceipt.contractAddress
          })
      }).should.be.fulfilled

    })

    it('contract address code should be correct', () => {
      return solquester.eth.getCode(contractAddress1).should.eventually.amorphEqual(storageContract.runtimeBytecode)
    })

  })

  describe('sendRawTransaction', () => {

    it('should deploy contract', () => {
      const transactionRequest = new TransactionRequest({
        data: storageContract.bytecode,
        gasLimit: new Amorph(3141592, 'number')
      })
      const signedRawTransaction = transactionRequest.sign(personas[0].privateKey)
      return solquester.eth.sendRawTransaction(signedRawTransaction).then((transactionHash) => {
        return solquester
          .pollForTransactionReceipt(transactionHash)
          .then((transactionReceipt) => {
            contractAddress2 = transactionReceipt.contractAddress
          })
      }).should.be.fulfilled
    })

    it('contract address code should be correct', () => {
      return solquester.eth.getCode(contractAddress2).should.eventually.amorphEqual(storageContract.runtimeBytecode)
    })

  })

  describe('call', () => {

    it('should get correct result', () => {
      const solquest = storageContract.solbuilder.get(contractAddress1, 'pos0()')
      return solquester.eth.call.apply(solquester, solquest.args).should.eventually.amorphTo('number').equal(1234)
    })

  })

  describe('estimateGas', () => {

    it('should return 21000 for a simple transfer', () => {
      const transactionRequest = new TransactionRequest({
        from: accounts[0],
        to: accounts[1],
        value: new Amorph(1, 'number')
      })
      return solquester.eth.estimateGas(transactionRequest).should.eventually.amorphTo('number').equal(21000)
    })

  })

  describe('getBlockByNumber', () => {

    it('should be fulfilled', () => {
      return solquester.eth.getBlockByNumber(new Amorph(1, 'number')).then((block1) => {
        block1ByNumber = block1
      })
    })

    it('block1ByNumber should be instance of Block', () => {
      return block1ByNumber.should.be.instanceof(Block)
    })

  })

  describe('getBlockByHash', () => {

    it('should be fulfilled', () => {
      return solquester.eth.getBlockByHash(block1ByNumber.hash).then((block1) => {
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

  describe('getTransactionByHash', () => {

    let transaction

    it('should be fulfilled', () => {
      return solquester.eth.getTransactionByHash(block1ByNumber.transactionHashes[0]).then((_transaction) => {
        transaction = _transaction
      })
    })

    it('transaction should be instance of Transaction', () => {
      return transaction.should.be.instanceof(Transaction)
    })

    it('transaction hash should be correct', () => {
      return transaction.hash.should.amorphEqual(block1ByNumber.transactionHashes[0])
    })

  })

  describe('getTransactionReceipt', () => {

    let transactionReceipt

    it('should be fulfilled', () => {
      return solquester.eth.getTransactionReceipt(block1ByNumber.transactionHashes[0]).then((_transactionReceipt) => {
        transactionReceipt = _transactionReceipt
      })
    })

    it('transaction should be instance of TransactionReceipt', () => {
      return transactionReceipt.should.be.instanceof(TransactionReceipt)
    })

  })

  // describe('eth_sendTransaction', () => {

  //   const dataArray = new Array(32).fill(1)
  //   const data = new Amorph(dataArray, 'array')

  //   let signedData

  //   it('data should be fulfilled', () => {
  //     return solquester.eth.sign(accounts[0], data).then((_signedData) => {
  //       signedData = _signedData
  //     }).should.be.fulfilled
  //   })

  //   it('should be 32 bytes long', () => {
  //     signedData.to('array').should.have.length(65)
  //   })

  //   it('should NOT be zero', () => {
  //     signedData.to('number').should.not.equal(0)
  //   })

  // })


  // describe('getBlockTransactionCount...', () => {
    
  //   let blockNumber
  //   let block

  //   it('should get blockNumber', () => {
  //     return solquester.eth.getBlockNumber().then((_blockNumber) => { blockNumber = _blockNumber })
  //   })

  //   it('should get block', () => {
  //     return solquester.eth.getBlockByNumber(blockNumber, true).then((_block) => { block = _block })
  //   })

  //   describe('..ByNumber', () => {
  //     it('should be 1', () => {
  //       return solquester.eth.getBlockTransactionCountByNumber(blockNumber).should.eventually.amorphTo('number').equal(1)
  //     })
  //   })

  //   describe('..ByHash', () => {
  //     it('should be 1', () => {
  //       return solquester.eth.getBlockTransactionCountByHash(block.hash).should.eventually.amorphTo('number').equal(1)
  //     })
  //   })


  //})


})