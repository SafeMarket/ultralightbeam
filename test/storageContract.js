const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolWrapper = require('../lib/SolWrapper')

const storageContract = {
  sol: `pragma solidity ^0.4.4;
        contract Storage {
          uint public pos0;
          mapping(address => uint) pos1;

          function Storage() payable {
              pos0 = 1234;
              pos1[msg.sender] = 5678;
          }
        }`
}

const solcOutput = solc.compile(storageContract.sol, 1).contracts.Storage

storageContract.abi = JSON.parse(solcOutput.interface)
storageContract.bytecode = new Amorph(solcOutput.bytecode, 'hex')
storageContract.runtimeBytecode = new Amorph(solcOutput.runtimeBytecode, 'hex')

describe('storageContract', () => {
  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      storageContract.bytecode, storageContract.abi, [], { value: new Amorph(1, 'number') }
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      storageContract.address = transactionReceipt.contractAddress
      storageContract.SolWrapper = new SolWrapper(
        ultralightbeam, storageContract.abi, storageContract.address
      )
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(storageContract.address).should.eventually.amorphEqual(
      storageContract.runtimeBytecode, 'hex'
    )
  })

  it('should have correct value', () => {
    return ultralightbeam.eth.getBalance(storageContract.address).should.eventually.amorphTo('number').equal(1)
  })
})

module.exports = storageContract
