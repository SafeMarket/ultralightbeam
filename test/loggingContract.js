const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolWrapper = require('../lib/SolWrapper')
const amorphParseSolcOutput = require('amorph-parse-solc-output')
const _ = require('lodash')

const loggingContract = {
  sol: `pragma solidity ^0.4.4;
        contract Logging {
          event Hello(uint blockNumber, address sender);

          function hello() {
            Hello(block.number, msg.sender);
          }
        }`
}

_.merge(loggingContract, amorphParseSolcOutput(solc.compile(loggingContract.sol, 1)).Logging)

describe('loggingContract', () => {

  let transactionReceipt

  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      loggingContract.code, loggingContract.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      _transactionReceipt
    ) => {
      loggingContract.address = _transactionReceipt.contractAddress
      loggingContract.solWrapper = new SolWrapper(
        ultralightbeam, loggingContract.abi, loggingContract.address
      )
    })
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(loggingContract.address).should.eventually.amorphEqual(
      loggingContract.runcode, 'hex'
    )
  })

  it('should call hello', () => {
    return loggingContract.solWrapper.broadcast('hello()', []).getTransactionReceipt().then((
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

module.exports = loggingContract
