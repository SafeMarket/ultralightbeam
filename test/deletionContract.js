const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const parseSolcOutput = require('../lib/parseSolcOutput')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')

const contractSol = `
  pragma solidity ^0.4.4;
  contract Contract {
    mapping (uint256 => bytes) values;

    function getValue(uint256 _index) returns(bytes) {
      return values[_index];
    }

    function setValue(uint256 _index, bytes _value) {
      values[_index] = _value;
    }

    function deleteValue(uint256 _index) {
      delete values[_index];
    }
  }`
const contractInfo = parseSolcOutput(solc.compile(contractSol, 1)).Contract
const zero = Amorph.from(amorphNumber.unsigned, 0)
const one = Amorph.from(amorphNumber.unsigned, 1)
const two = Amorph.from(amorphNumber.unsigned, 2)

describe('deletionContract', () => {
  let contract
  it('should deploy', () => {
    return ultralightbeam.solDeploy(contractInfo.code, contractInfo.abi, [], {}).then((_contract) => {
      contract = _contract
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(contract.address).should.eventually.amorphEqual(contractInfo.runcode)
  })

  it('should set 1 to 2', () => {
    return contract.broadcast('setValue(uint256,bytes)', [one, two], {}).getConfirmation().then(() => {
      return contract.fetch('getValue(uint256)', [one]).should.eventually.amorphEqual(two)
    })
  })

  it('should delete 1', () => {
    return contract.broadcast('deleteValue(uint256)', [one], {}).getConfirmation().then(() => {
      return contract.fetch('getValue(uint256)', [one]).should.eventually.amorphEqual(zero)
    })
  })

})
