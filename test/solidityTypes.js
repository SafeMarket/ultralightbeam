const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const stripType = require('../lib/stripType')
const SolWrapper = require('../lib/SolWrapper')
const persona = require('../modules/persona')

const typesContract = {
  sol: `pragma solidity ^0.4.4;
        contract Types {
          address public myAddress;
          bool public myBool;
          bytes public myBytes;
          int public myInt;
          string public myString;
          uint public myUint;
          function Types() payable {
            myAddress = msg.sender;
            myBool = true;
            myBytes.push(0x01);
            myInt = -2;
            myString = '3';
            myUint = 4;
          }
        }`
}
const solcOutput = solc.compile(typesContract.sol, 1).contracts.Types

typesContract.abi = JSON.parse(solcOutput.interface)
typesContract.bytecode = new Amorph(solcOutput.bytecode, 'hex')
typesContract.runtimeBytecode = new Amorph(solcOutput.runtimeBytecode, 'hex')

describe('stripType', () => {
  it('should strip "bytes"', () => {
    stripType('bytes').should.equal('bytes')
  })
  it('should strip "bytes4"', () => {
    stripType('bytes4').should.equal('bytes')
  })
  it('should strip "bytes32"', () => {
    stripType('bytes32').should.equal('bytes')
  })
  it('should strip "uint256"', () => {
    stripType('uint256').should.equal('uint')
  })
})

describe('typesContract', () => {
  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      typesContract.bytecode, typesContract.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      typesContract.address = transactionReceipt.contractAddress
      typesContract.SolWrapper = new SolWrapper(
        ultralightbeam, typesContract.abi, typesContract.address
      )
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(typesContract.address).should.eventually.amorphEqual(
      typesContract.runtimeBytecode, 'hex'
    )
  })

  describe('myAddress', () => {
    it('should be msg.sender', () => {
      typesContract.SolWrapper.fetch('myAddress()', []).should.eventually.amorphEqual(
        persona.address, 'hex'
      )
    })
  })

  describe('myBool', () => {
    it('should be true', () => {
      typesContract.SolWrapper.fetch('myBool()', []).should.eventually.amorphTo(
        'boolean'
      ).equal(true)
    })
  })

  describe('myBytes', () => {
    it('should be 01', () => {
      typesContract.SolWrapper.fetch('myBytes()', []).should.eventually.amorphTo(
        'hex'
      ).equal('01')
    })
  })

  describe('myInt', () => {
    it('should be -2', () => {
      typesContract.SolWrapper.fetch('myInt()', []).should.eventually.amorphTo(
        'number'
      ).equal(-2)
    })
  })

  describe('myString', () => {
    it('should be "3"', () => {
      typesContract.SolWrapper.fetch('myString()', []).should.eventually.amorphTo(
        'ascii'
      ).equal('3')
    })
  })

  describe('myUint', () => {
    it('should be 4', () => {
      typesContract.SolWrapper.fetch('myUint()', []).should.eventually.amorphTo(
        'number'
      ).equal(4)
    })
  })


})

module.exports = typesContract
