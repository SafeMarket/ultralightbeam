const _ = require('lodash')
const Solbuilder = require('../lib/Solbuilder')
const Amorph = require('../modules/Amorph')
const chai = require('../modules/chai')
const TransactionReceipt = require('../lib/TransactionReceipt')
const Solquester = require('../lib/Solquester')
const TestRPC = require('ethereumjs-testrpc')
const personas = require('../modules/personas')

require('./interfaces')

const solquester = new Solquester(TestRPC.provider({
  blocktime: 3,
  accounts: personas.map((persona) => {
    return {
      balance: persona.balance.to('number'),
      secretKey: persona.privateKey.to('hex.prefixed')
    }
  })
}))
solquester.defaults.gas = new Amorph(3000000, 'number')
solquester.defaults.gasPrice = new Amorph(20000000000, 'number')

describe('solquester', () => {

  it('should set solquester.defaults.from', () => {
    return solquester
      .eth.getAccounts()
      .then((_accounts) => {
        solquester.defaults.from = _accounts[0]
      })
      .should.be.fulfilled
  })

})

// describe('Simple', () => {

//   let transactionHash
//   let transactionReceipt
//   let simpleSolbuilder
//   let address

//   it('should create simpleSolbuilder', () => {
//     simpleBuilder = new Solbuilder(contracts.Simple.abi, contracts.Simple.bytecode)
//   })


//   it('should deploy', () => {
//     return solquester
//       .add(simpleBuilder.deploy([]))
//       .withHandler((_transactionHash) => {
//         transactionHash = _transactionHash
//       })
//       .promise.should.be.fulfilled
//   })

//   it('result should have transactionHash', () => {
//     transactionHash.should.be.instanceof(Amorph)
//   })

//   it('getTransactionReceipt should be null', () => {
//     return solquester.eth.getTransactionReceipt(transactionHash).promise.should.eventually.equal(null)
//   })

//   it('should wait a second', (done) => {
//     setTimeout(done, 2000)
//   })

//   it('getTransactionReceipt should be instanceof TransactionReceipt', () => {
//     return solquester.eth.getTransactionReceipt(transactionHash).withHandler((_transactionReciept) => {
//       transactionReceipt = _transactionReciept
//       address = transactionReceipt.contractAddress
//     }).promise.should.eventually.be.instanceof(TransactionReceipt)
//   })

//   it('transactionReceipt.address should be address', () => {
//     address.to('hex.prefixed').should.be.an.address()
//   })

//   it('getCode should deep equal runtimeBytecode', () => {
//     return solquester
//       .eth.getCode(address)
//       .promise.should.eventually.amorphTo('hex').equal(contracts.Simple.runtimeBytecode.to('hex'))
//   })

//   it('var1 should be equal to 1', () => {
//     return solquester
//       .add(simpleBuilder.get(address, 'var1()'))
//       .promise.should.eventually.amorphTo('number').equal(1)
//   })

//   it('var2 should be equal to 2', () => {
//     return solquester
//       .add(simpleBuilder.get(address, 'var2()'))
//       .promise.should.eventually.amorphTo('number').equal(2)
//   })

// })

module.exports = solquester
