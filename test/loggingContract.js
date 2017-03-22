const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const amorphParseSolcOutput = require('amorph-parse-solc-output')

const loggingContractSol =
  `pragma solidity ^0.4.4;
  contract Logging {
    event Hello(uint blockNumber, address sender);

    function hello() {
      Hello(block.number, msg.sender);
    }
  }`
const loggingContractInfo = amorphParseSolcOutput(solc.compile(loggingContractSol, 1)).Logging

describe('loggingContract', () => {

  let transactionReceipt
  let loggingContract

  it('should deploy', () => {
    return ultralightbeam.solDeploy(loggingContractInfo.code, loggingContractInfo.abi, []).then((_loggingContract) => {
      loggingContract = _loggingContract
    })
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(loggingContract.address).should.eventually.amorphEqual(
      loggingContractInfo.runcode, 'hex'
    )
  })

  it('should call hello', () => {
    return loggingContract.broadcast('hello()', []).getTransactionReceipt().then((
      _transactionReceipt
    ) => {
      transactionReceipt = _transactionReceipt
    })
  })

  it('transactionReceipt.logs should be correct', () => {
    transactionReceipt.logs.should.be.instanceOf(Array)
    transactionReceipt.logs.should.have.length(1)
    transactionReceipt.logs[0].topics.should.be.instanceOf(Array)
    transactionReceipt.logs[0].topics[0].to('array').should.have.length(32)
  })

})
