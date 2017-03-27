const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const stripType = require('../lib/stripType')
const account = require('./account')
const amorphParseSolcOutput = require('amorph-parse-solc-output')

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

const typesContractInfo = amorphParseSolcOutput(solc.compile(typesContractSol, 1)).Types

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
    return ultralightbeam.eth.getCode(typesContract.address).should.eventually.amorphEqual(
      typesContractInfo.runcode, 'hex'
    )
  })

  describe('myAddress', () => {
    it('should be msg.sender', () => {
      typesContract.fetch('myAddress()', []).should.eventually.amorphEqual(
        account.address, 'hex'
      )
    })
  })

  describe('myBool', () => {
    it('should be true', () => {
      typesContract.fetch('myBool()', []).should.eventually.amorphTo(
        'boolean'
      ).equal(true)
    })
  })

  describe('myBytes', () => {
    it('should be 01', () => {
      typesContract.fetch('myBytes()', []).should.eventually.amorphTo(
        'hex'
      ).equal('01')
    })
  })

  describe('myInt', () => {
    it('should be -2', () => {
      typesContract.fetch('myInt()', []).should.eventually.amorphTo(
        'number'
      ).equal(-2)
    })
  })

  describe('myString', () => {
    it('should be "3"', () => {
      typesContract.fetch('myString()', []).should.eventually.amorphTo(
        'ascii'
      ).equal('3')
    })
  })

  describe('myUint', () => {
    it('should be 4', () => {
      typesContract.fetch('myUint()', []).should.eventually.amorphTo(
        'number'
      ).equal(4)
    })
  })

})
