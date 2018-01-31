const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const parseSolcOutput = require('../lib/parseSolcOutput')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')
const amorphBoolean = require('amorph-boolean')

const arrayValSol = `
  pragma solidity ^0.4.4;
  contract ArrayVal {
    uint[] uints;
    bool[] bools;

    function setUints(uint[] _uints) {
      uints = _uints;
    }

    function getUints() constant returns(uint[]){
      return uints;
    }

    function setUintsAndBools(uint[] _uints, bool[] _bools) {
      uints = _uints;
      bools = _bools;
    }

    function getUintsAndBools() constant returns(uint[], bool[]) {
      return (uints, bools);
    }

    function getUintsAndBoolsWithNames() constant returns(uint[] myUints, bool[] myBools) {
      return (uints, bools);
    }
  }`
const arrayValInfo = parseSolcOutput(solc.compile(arrayValSol, 1)).ArrayVal

describe('arrayValContract', () => {
  let arrayValContract
  it('should deploy', () => {
    return ultralightbeam.solDeploy(arrayValInfo.code, arrayValInfo.abi, [], {}).then((_arrayValContract) => {
      arrayValContract = _arrayValContract
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(arrayValContract.address).should.eventually.amorphEqual(arrayValInfo.runcode)
  })

  it('should getUints() as []', () => {
    return arrayValContract.fetch('getUints()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(0)
    })
  })

  it('should getUintsAndBools() as [[],[]]', () => {
    return arrayValContract.fetch('getUintsAndBools()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(2)
      values[0].should.be.instanceOf(Array)
      values[1].should.be.instanceOf(Array)
      values[0].should.have.length(0)
      values[1].should.have.length(0)
    })
  })

  it('should setUints([0, 1, 2])', () => {
    return arrayValContract.broadcast('setUints(uint256[])', [
      [
        Amorph.from(amorphNumber.unsigned, 0),
        Amorph.from(amorphNumber.unsigned, 1),
        Amorph.from(amorphNumber.unsigned, 2)
      ]
    ], {}).transactionPromise
  })

  it('should getUints() values [0, 1, 2]', () => {
    return arrayValContract.fetch('getUints()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(3)
      values[0].should.amorphTo(amorphNumber.unsigned).equal(0)
      values[1].should.amorphTo(amorphNumber.unsigned).equal(1)
      values[2].should.amorphTo(amorphNumber.unsigned).equal(2)
    })
  })

  it('should setUintsAndBools([3, 4, 5], [false, true])', () => {
    return arrayValContract.broadcast('setUintsAndBools(uint256[],bool[])', [
      [
        Amorph.from(amorphNumber.unsigned, 3),
        Amorph.from(amorphNumber.unsigned, 4),
        Amorph.from(amorphNumber.unsigned, 5)
      ],
      [
        Amorph.from(amorphBoolean, false),
        Amorph.from(amorphBoolean, true)
      ]
    ], {}).transactionPromise
  })

  it('should getUintsAndBools() values [[3, 4, 5], [false, true]]', () => {
    return arrayValContract.fetch('getUintsAndBools()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(2)
      values[0].should.be.instanceOf(Array)
      values[1].should.be.instanceOf(Array)
      values[0].should.have.length(3)
      values[1].should.have.length(2)

      values[0][0].should.amorphTo(amorphNumber.unsigned).equal(3)
      values[0][1].should.amorphTo(amorphNumber.unsigned).equal(4)
      values[0][2].should.amorphTo(amorphNumber.unsigned).equal(5)

      values[1][0].should.amorphTo(amorphBoolean).equal(false)
      values[1][1].should.amorphTo(amorphBoolean).equal(true)
    })
  })

  it('should getUintsAndBoolsWithNames() values { myUints: [3, 4, 5], myBools: [false, true] }', () => {
    return arrayValContract.fetch('getUintsAndBoolsWithNames()', []).then((values) => {
      values.should.have.keys(['myUints', 'myBools'])

      values.myUints.should.be.instanceOf(Array)
      values.myBools.should.be.instanceOf(Array)

      values.myUints.should.have.length(3)
      values.myBools.should.have.length(2)

      values.myUints[0].should.amorphTo(amorphNumber.unsigned).equal(3)
      values.myUints[1].should.amorphTo(amorphNumber.unsigned).equal(4)
      values.myUints[2].should.amorphTo(amorphNumber.unsigned).equal(5)

      values.myBools[0].should.amorphTo(amorphBoolean).equal(false)
      values.myBools[1].should.amorphTo(amorphBoolean).equal(true)
    })
  })
})
