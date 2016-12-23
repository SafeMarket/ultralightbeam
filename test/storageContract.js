const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const blockFlags = require('../lib/blockFlags')
const Solwrapper = require('../lib/Solwrapper')

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
    return ultralightbeam.sendTransaction(transactionRequest).then((transactionReceipt) => {
      storageContract.address = transactionReceipt.contractAddress
      storageContract.solwrapper = new Solwrapper(
        ultralightbeam, storageContract.abi, storageContract.address
      )
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(
      storageContract.address, blockFlags.latest
    ).should.eventually.amorphEqual(
      storageContract.runtimeBytecode, 'hex'
    )
  })

  it('should have correct value', () => {
    return ultralightbeam.eth.getBalance(
      storageContract.address, blockFlags.latest
    ).should.eventually.amorphTo('number').equal(1)
  })
})

module.exports = storageContract
