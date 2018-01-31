const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const parseSolcOutput = require('../lib/parseSolcOutput')
const FailedTransactionError = require('../lib/errors/FailedTransaction')
const amorphBignumber = require('amorph-bignumber')

const oogContractSol =
  `pragma solidity ^0.4.4;
  contract OOG {

    uint256 j;

    function doThing() {
      for(uint256 i = 0; i < 10; i++) {
        j = i;
      }
    }

  }`

const oogContractInfo = parseSolcOutput(solc.compile(oogContractSol, 1)).OOG

describe('failedTransaction', () => {

  let gas
  let oogContract

  it('should deploy', () => {
    return ultralightbeam.solDeploy(oogContractInfo.code, oogContractInfo.abi, [], {}).then((_oogContract) => {
      oogContract = _oogContract
    })
  })

  it('doThing() should be fulfilled', () => {
    return oogContract.broadcast('doThing()', [], {}).getTransactionReceipt().then((transactionReceipt) => {
      gas = transactionReceipt.gasUsed
    })
  })

  it('setBlockNumber() with not enough gas should be rejected with FailedTransactionError', () => {
    return oogContract.broadcast('doThing()', [], {
      gas: gas.as(amorphBignumber.unsigned, (bignumber) => { return bignumber.minus(1) })
    }).getConfirmation().should.be.rejectedWith(FailedTransactionError)
  })
})
