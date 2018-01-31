const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const parseSolcOutput = require('../lib/parseSolcOutput')
const FailedTransactionError = require('../lib/errors/FailedTransaction')

const badContractSol = `
  pragma solidity ^0.4.0;
  contract BadContract {
    function BadContract() public{
      throw;
    }
  }
`

const badContractSolInfo = parseSolcOutput(solc.compile(badContractSol, 1)).BadContract

describe('badContract', () => {

  it('should not deploy', () => {
    return ultralightbeam.solDeploy(badContractSolInfo.code, badContractSolInfo.abi, [], {}).should.eventually.be.rejectedWith(Error)
  })
})
