const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolWrapper = require('../lib/SolWrapper')
const errors = require('../lib/errors')

const oogContract = {
  sol: `pragma solidity ^0.4.4;
        contract OOG {

          uint256 j;

          function doThing() {
            for(uint256 i = 0; i < 100; i++) {
              j = i;
            }
          }

        }`
}

const solcOutput = solc.compile(oogContract.sol, 1).contracts.OOG

oogContract.abi = JSON.parse(solcOutput.interface)
oogContract.bytecode = new Amorph(solcOutput.bytecode, 'hex')
oogContract.runtimeBytecode = new Amorph(solcOutput.runtimeBytecode, 'hex')

describe('oogContract', () => {

  let gas

  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      oogContract.bytecode, oogContract.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      oogContract.address = transactionReceipt.contractAddress
      oogContract.SolWrapper = new SolWrapper(
        ultralightbeam, oogContract.abi, oogContract.address
      )
    })
  })

  it('doThing() should be fulfilled', () => {
    return oogContract.SolWrapper.broadcast('doThing()').getTransactionReceipt().then((transactionReceipt) => {
      gas = transactionReceipt.gasUsed
    })
  })

  it('setBlockNumber() with not enough gas should be rejected with OOGError', () => {
    return oogContract.SolWrapper.broadcast('doThing()', [], {
      gas: gas.as('bignumber', (bignumber) => { return bignumber.minus(1) })
    }).getConfirmation().should.be.rejectedWith(errors.OOGError)
  })
})

module.exports = oogContract
