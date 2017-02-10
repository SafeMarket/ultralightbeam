const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolWrapper = require('../lib/SolWrapper')
const amorphParseSolcOutput = require('amorph-parse-solc-output')
const _ = require('lodash')

const eventsContract = {
  sol: `pragma solidity ^0.4.4;
        contract Events {
          event Creation(uint256 blockNumber, uint256 timestamp);

          event A(uint256 a);
          event B(uint256 b);

          function Events() payable {
            Creation(block.number, now);
          }

          function doThing(uint256 a, uint256 b) {
            A(a);
            B(b);
          }
        }`
}

_.merge(eventsContract, amorphParseSolcOutput(solc.compile(eventsContract.sol, 1)).Events)

describe('eventsContract', () => {
  let eventLogs

  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      eventsContract.code, eventsContract.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      eventsContract.address = transactionReceipt.contractAddress
      eventsContract.SolWrapper = new SolWrapper(
        ultralightbeam, eventsContract.abi, eventsContract.address
      )
      eventLogs = eventsContract.SolWrapper.parseTransactionReceipt(transactionReceipt)
    }).should.be.fulfilled
  })

  it('parsed should be correct', () => {
    eventLogs.should.have.length(1)
    eventLogs[0].signature.should.equal('Creation(uint256,uint256)')
    eventLogs[0].values.should.have.length(2)
    eventLogs[0].values[0].should.amorphEqual(ultralightbeam.blockPoller.block.number, 'number')
    eventLogs[0].values[1].should.amorphEqual(ultralightbeam.blockPoller.block.timestamp, 'number')
    eventLogs[0].topics.should.have.keys(['blockNumber', 'timestamp'])
    eventLogs[0].topics.blockNumber.should.amorphEqual(ultralightbeam.blockPoller.block.number, 'number')
    eventLogs[0].topics.timestamp.should.amorphEqual(ultralightbeam.blockPoller.block.timestamp, 'number')
  })
})

module.exports = eventsContract
