const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolWrapper = require('../lib/SolWrapper')

const arrayValContract = {
  sol: `pragma solidity ^0.4.4;
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
        }`
}

const solcOutput = solc.compile(arrayValContract.sol, 1).contracts.ArrayVal

arrayValContract.abi = JSON.parse(solcOutput.interface)
arrayValContract.bytecode = new Amorph(solcOutput.bytecode, 'hex')
arrayValContract.runtimeBytecode = new Amorph(solcOutput.runtimeBytecode, 'hex')

describe('arrayValContract', () => {
  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      arrayValContract.bytecode, arrayValContract.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      arrayValContract.address = transactionReceipt.contractAddress
      arrayValContract.SolWrapper = new SolWrapper(
        ultralightbeam, arrayValContract.abi, arrayValContract.address
      )
    })
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(arrayValContract.address).should.eventually.amorphEqual(
      arrayValContract.runtimeBytecode, 'hex'
    )
  })

  it('should getUints() as []', () => {
    return arrayValContract.SolWrapper.fetch('getUints()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(0)
    })
  })

  it('should getUintsAndBools() as [[],[]]', () => {
    return arrayValContract.SolWrapper.fetch('getUintsAndBools()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(2)
      values[0].should.be.instanceOf(Array)
      values[1].should.be.instanceOf(Array)
      values[0].should.have.length(0)
      values[1].should.have.length(0)
    })
  })

  it('should setUints([0, 1, 2])', () => {
    return arrayValContract.SolWrapper.broadcast('setUints(uint256[])', [
      [
        new Amorph(0, 'number'),
        new Amorph(1, 'number'),
        new Amorph(2, 'number')
      ]
    ]).transactionPromise
  })

  it('should getUints() values [0, 1, 2]', () => {
    return arrayValContract.SolWrapper.fetch('getUints()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(3)
      values[0].should.amorphTo('number').equal(0)
      values[1].should.amorphTo('number').equal(1)
      values[2].should.amorphTo('number').equal(2)
    })
  })

  it('should setUintsAndBools([3, 4, 5], [false, true])', () => {
    return arrayValContract.SolWrapper.broadcast('setUintsAndBools(uint256[],bool[])', [
      [
        new Amorph(3, 'number'),
        new Amorph(4, 'number'),
        new Amorph(5, 'number')
      ],
      [
        new Amorph(false, 'boolean'),
        new Amorph(true, 'boolean')
      ]
    ]).transactionPromise
  })

  it('should getUintsAndBools() values [[3, 4, 5], [false, true]]', () => {
    return arrayValContract.SolWrapper.fetch('getUintsAndBools()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(2)
      values[0].should.be.instanceOf(Array)
      values[1].should.be.instanceOf(Array)
      values[0].should.have.length(3)
      values[1].should.have.length(2)

      values[0][0].should.amorphTo('number').equal(3)
      values[0][1].should.amorphTo('number').equal(4)
      values[0][2].should.amorphTo('number').equal(5)

      values[1][0].should.amorphTo('boolean').equal(false)
      values[1][1].should.amorphTo('boolean').equal(true)
    })
  })
})

module.exports = arrayValContract
