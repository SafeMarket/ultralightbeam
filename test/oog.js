const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const amorphParseSolcOutput = require('./parseSolcOutput')
const OOGError = require('../lib/errors/OOG')

const oogContractSol =
  `pragma solidity ^0.4.4;
  contract OOG {

    uint256 j;

    function doThing() {
      for(uint256 i = 0; i < 100; i++) {
        j = i;
      }
    }

  }`

const oogContractInfo = amorphParseSolcOutput(solc.compile(oogContractSol, 1)).OOG

describe('oogContract', () => {

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

  it('setBlockNumber() with not enough gas should be rejected with OOG', () => {
    return oogContract.broadcast('doThing()', [], {
      gas: gas.as('bignumber', (bignumber) => { return bignumber.minus(1) })
    }).getConfirmation().should.be.rejectedWith(OOGError)
  })
})
