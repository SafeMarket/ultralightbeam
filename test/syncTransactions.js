const ultralightbeam = require('./ultralightbeam')
const parseSolcOutput = require('../lib/parseSolcOutput')
const Promise = require('bluebird')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')
const solc = require('solc')
const accounts = require('./accounts')
const _ = require('lodash')

const addingContractSol =
  `pragma solidity ^0.4.4;
  contract AddingContract {
    uint256 public sum;

    function add(uint256 num) public{
      sum = sum + num;
    }
  }`

const addingContractInfo = parseSolcOutput(solc.compile(addingContractSol, 1)).AddingContract

describe('sync transactions', () => {
  let addingContract
  it('should deploy adding contract', () => {
    return ultralightbeam.solDeploy(addingContractInfo.code, addingContractInfo.abi, [], {}).then((_addingContract) => {
      addingContract = _addingContract
    })
  })
  it('should add 1..3 synchronously', () => {
    return Promise.all([
      addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 1)], {}).getConfirmation(),
      addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 2)], {}).getConfirmation(),
      addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 3)], {}).getConfirmation()
    ])
  })
  it('should get sum as 6', () => {
    return addingContract.fetch('sum()', []).should.eventually.amorphTo(amorphNumber.unsigned).equal(6)
  })
  it('it should add 4...6 synchronously', () => {
    return Promise.all([
      addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 4)], {
        from: accounts[1]
      }).getConfirmation(),
      addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 5)], {
        from: accounts[1]
      }).getConfirmation(),
      addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 6)], {
        from: accounts[1]
      }).getConfirmation()
    ])
  })
  it('should get sum as 21', () => {
    return addingContract.fetch('sum()', []).should.eventually.amorphTo(amorphNumber.unsigned).equal(21)
  })

  // TODO: Find out why this fails
  // it('it should add 7...10 synchronously', () => {
  //   return Promise.all([
  //     addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 7)], {
  //       from: accounts[0]
  //     }).getConfirmation(),
  //     addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 8)], {
  //       from: accounts[1]
  //     }).getConfirmation(),
  //     addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 9)], {
  //       from: accounts[1]
  //     }).getConfirmation(),
  //     addingContract.broadcast('add(uint256)', [Amorph.from(amorphNumber.unsigned, 10)], {
  //       from: accounts[0]
  //     }).getConfirmation()
  //   ])
  // })
  // it('should get sum as 55', () => {
  //   return addingContract.fetch('sum()', []).should.eventually.amorphTo(amorphNumber.unsigned).equal(55)
  // })
})
