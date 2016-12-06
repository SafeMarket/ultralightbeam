const _ = require('lodash')
const Solbuilder = require('../lib/Solbuilder')
const Amorph = require('../lib/Amorph')
const chai = require('../modules/chai')
const TransactionReceipt = require('../lib/TransactionReceipt')
const Ultralightbeam = require('../')
const TestRPC = require('ethereumjs-testrpc')
const personas = require('../modules/personas')

require('./interfaces')

const ultralightbeam = new Ultralightbeam(TestRPC.provider({
  blocktime: 3,
  accounts: personas.map((persona) => {
    return {
      balance: persona.balance.to('number'),
      secretKey: persona.privateKey.to('hex.prefixed')
    }
  })
}))
ultralightbeam.defaults.gas = new Amorph(3000000, 'number')
ultralightbeam.defaults.gasPrice = new Amorph(20000000000, 'number')

describe('ultralightbeam', () => {

  it('should set ultralightbeam.defaults.from', () => {
    return ultralightbeam
      .eth.getAccounts()
      .then((_accounts) => {
        ultralightbeam.defaults.from = _accounts[0]
      })
      .should.be.fulfilled
  })

})

module.exports = ultralightbeam

require('./validation')
require('./rejection')

// describe('Simple', () => {

//   let transactionHash
//   let transactionReceipt
//   let simpleSolbuilder
//   let address

//   it('should create simpleSolbuilder', () => {
//     simpleBuilder = new Solbuilder(contracts.Simple.abi, contracts.Simple.bytecode)
//   })


//   it('should deploy', () => {
//     return ultralightbeam
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
//     return ultralightbeam.eth.getTransactionReceipt(transactionHash).promise.should.eventually.equal(null)
//   })

//   it('should wait a second', (done) => {
//     setTimeout(done, 2000)
//   })

//   it('getTransactionReceipt should be instanceof TransactionReceipt', () => {
//     return ultralightbeam.eth.getTransactionReceipt(transactionHash).withHandler((_transactionReciept) => {
//       transactionReceipt = _transactionReciept
//       address = transactionReceipt.contractAddress
//     }).promise.should.eventually.be.instanceof(TransactionReceipt)
//   })

//   it('transactionReceipt.address should be address', () => {
//     address.to('hex.prefixed').should.be.an.address()
//   })

//   it('getCode should deep equal runtimeBytecode', () => {
//     return ultralightbeam
//       .eth.getCode(address)
//       .promise.should.eventually.amorphTo('hex').equal(contracts.Simple.runtimeBytecode.to('hex'))
//   })

//   it('var1 should be equal to 1', () => {
//     return ultralightbeam
//       .add(simpleBuilder.get(address, 'var1()'))
//       .promise.should.eventually.amorphTo('number').equal(1)
//   })

//   it('var2 should be equal to 2', () => {
//     return ultralightbeam
//       .add(simpleBuilder.get(address, 'var2()'))
//       .promise.should.eventually.amorphTo('number').equal(2)
//   })

// })
