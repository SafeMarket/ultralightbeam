const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const stripType = require('../lib/stripType')
const account = require('./account')
const parseSolcOutput = require('../lib/parseSolcOutput')
const amorphHex = require('amorph-hex')
const amorphAscii = require('amorph-ascii')
const amorphBoolean = require('amorph-boolean')
const amorphNumber = require('amorph-number')

const typesContractSol = `
  pragma solidity ^0.4.4;
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

const typesContractInfo = parseSolcOutput(solc.compile(typesContractSol, 1)).Types

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
  let typesContract
  it('should deploy', () => {
    return ultralightbeam.solDeploy(typesContractInfo.code, typesContractInfo.abi, [], {}).then((_typesContract) => {
      typesContract = _typesContract
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(typesContract.address).should.eventually.amorphEqual(typesContractInfo.runcode)
  })

  describe('myAddress', () => {
    it('should be msg.sender', () => {
      typesContract.fetch('myAddress()', []).should.eventually.amorphEqual(account.address)
    })
  })

  describe('myBool', () => {
    it('should be true', () => {
      typesContract.fetch('myBool()', []).should.eventually.amorphTo(amorphBoolean).equal(true)
    })
  })

  describe('myBytes', () => {
    it('should be 01', () => {
      typesContract.fetch('myBytes()', []).should.eventually.amorphTo(amorphHex.unprefixed).equal('01')
    })
  })

  describe('myInt', () => {
    it('should be -2', () => {
      typesContract.fetch('myInt()', []).should.eventually.amorphTo(amorphNumber.signed).equal(-2)
    })
  })

  describe('myString', () => {
    it('should be "3"', () => {
      typesContract.fetch('myString()', []).should.eventually.amorphTo(amorphAscii).equal('3')
    })
  })

  describe('myUint', () => {
    it('should be 4', () => {
      typesContract.fetch('myUint()', []).should.eventually.amorphTo(amorphNumber.unsigned).equal(4)
    })
  })

})
