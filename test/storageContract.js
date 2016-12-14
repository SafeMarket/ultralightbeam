const ultralightbeam = require('./ultralightbeam')
const Solbuilder = require('../lib/Solbuilder')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const blockFlags = require('../lib/blockFlags')

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
storageContract.solbuilder = new Solbuilder(
  storageContract.abi, storageContract.bytecode
)

describe('storageContract', () => {
  it('should deploy', () => {
    return ultralightbeam.add(storageContract.solbuilder.deploy([], {
      value: new Amorph(1, 'number')
    })).then((
      transactionReceipt
    ) => {
      storageContract.address = transactionReceipt.contractAddress
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
