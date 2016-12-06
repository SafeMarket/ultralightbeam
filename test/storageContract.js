const ultralightbeam = require('./ultralightbeam')
const Solbuilder = require('../lib/Solbuilder')
const solc = require('solc')
const Amorph = require('../lib/Amorph')

const storageContract = {
  sol: `pragma solidity ^0.4.4;
        contract Storage {
        uint public pos0;
        mapping(address => uint) pos1;

        function Storage() {
            pos0 = 1234;
            pos1[msg.sender] = 5678;
        }
      }`
}

const solcOutput = solc.compile(storageContract.sol, 1).contracts.Storage

storageContract.abi = JSON.parse(solcOutput.interface)
storageContract.bytecode = new Amorph(solcOutput.bytecode, 'hex')
storageContract.runtimeBytecode = new Amorph(solcOutput.runtimeBytecode, 'hex')
storageContract.solbuilder = new Solbuilder(storageContract.abi, storageContract.bytecode)

describe('storageContract', () => {
  it('should deploy', () => {
    return ultralightbeam
      .add(storageContract.solbuilder.deploy())
      .then((transactionHash) => {
        return ultralightbeam
          .pollForTransactionReceipt(transactionHash)
          .then((transactionReceipt) => {
            storageContract.address = transactionReceipt.contractAddress
          })
      }, (err) => {
        return Q.reject(err)
      }).should.be.fulfilled
  })
})

module.exports = storageContract