const ultralightbeam = require('./ultralightbeam')
const Solbuilder = require('../lib/Solbuilder')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const blockFlags = require('../lib/blockFlags')

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
typesContract.solbuilder = new Solbuilder(
  typesContract.abi, typesContract.bytecode
)

describe('typesContract', () => {
  it('should deploy', () => {
    return ultralightbeam.add(typesContract.solbuilder.deploy([], {
      value: new Amorph(1, 'number')
    })).then((
      transactionReceipt
    ) => {
      typesContract.address = transactionReceipt.contractAddress
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(
      typesContract.address, blockFlags.latest
    ).should.eventually.amorphEqual(
      typesContract.runtimeBytecode, 'hex'
    )
  })

  it('should have correct value', () => {
    return ultralightbeam.eth.getBalance(
      typesContract.address, blockFlags.latest
    ).should.eventually.amorphTo('number').equal(1)
  })

  describe('myAddress', () => {
    it('should be msg.sender', () => {
      const manifest = typesContract.solbuilder.get(
        typesContract.address, 'myAddress()', []
      )
      return ultralightbeam.add(manifest).should.eventually.amorphEqual(
        ultralightbeam.defaults.from.address, 'hex'
      )
    })
  })

  describe('myBool', () => {
    it('should be true', () => {
      const manifest = typesContract.solbuilder.get(
        typesContract.address, 'myBool()', []
      )
      return ultralightbeam.add(manifest).should.eventually.amorphTo(
        'boolean'
      ).equal(true)
    })
  })

  describe('myBytes', () => {
    it('should be 01', () => {
      const manifest = typesContract.solbuilder.get(
        typesContract.address, 'myBytes()', []
      )
      return ultralightbeam.add(manifest).should.eventually.amorphTo(
        'hex'
      ).equal('01')
    })
  })

  describe('myInt', () => {
    it('should be -2', () => {
      const manifest = typesContract.solbuilder.get(
        typesContract.address, 'myInt()', []
      )
      return ultralightbeam.add(manifest).should.eventually.amorphTo(
        'number'
      ).equal(-2)
    })
  })

  describe('myString', () => {
    it('should be "3"', () => {
      const manifest = typesContract.solbuilder.get(
        typesContract.address, 'myString()', []
      )
      return ultralightbeam.add(manifest).should.eventually.amorphTo(
        'ascii'
      ).equal('3')
    })
  })

  describe('myUint', () => {
    it('should be 4', () => {
      const manifest = typesContract.solbuilder.get(
        typesContract.address, 'myUint()', []
      )
      return ultralightbeam.add(manifest).should.eventually.amorphTo(
        'number'
      ).equal(4)
    })
  })


})

module.exports = typesContract
