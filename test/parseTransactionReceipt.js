const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const SolWrapper = require('../lib/SolWrapper')
const amorphParseSolcOutput = require('amorph-parse-solc-output')
const _ = require('lodash')
const personas = require('../modules/personas')
const Amorph = require('../lib/Amorph')

const eventsContract = {
  sol: `pragma solidity ^0.4.4;
        contract Events {
          event Creation(uint256 blockNumber, uint256 timestamp);

          event A(address sender, uint256 a);
          event B(uint256 b, address sender);

          function Events() payable {
            Creation(block.number, now);
          }

          function doThing(uint256 a, uint256 b) {
            A(msg.sender, a);
            B(b, msg.sender);
          }
        }`
}

_.merge(eventsContract, amorphParseSolcOutput(solc.compile(eventsContract.sol, 1)).Events)

describe('eventsContract', () => {

  describe('deploy', () => {
    let eventLogs
    it('should be fulfilled', () => {
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

    it('parsed transaction receipt should be correct', () => {
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

  describe('doThing()', () => {
    it('should emit correct events', () => {
      const one = new Amorph(1, 'number')
      const two = new Amorph(2, 'number')
      return eventsContract.SolWrapper.broadcast('doThing(uint256,uint256)', [
        one, two
      ]).getTransactionReceipt().then((transactionReceipt) => {
        const eventLogs = eventsContract.SolWrapper.parseTransactionReceipt(transactionReceipt)
        eventLogs.should.have.length(2)
        eventLogs[0].values.should.have.length(2)
        eventLogs[0].values[0].should.amorphEqual(personas[0].address, 'hex')
        eventLogs[0].values[1].should.amorphEqual(one)
        eventLogs[1].values.should.have.length(2)
        eventLogs[1].values[0].should.amorphEqual(two)
        eventLogs[1].values[1].should.amorphEqual(personas[0].address, 'hex')
        eventLogs[0].topics.should.have.keys(['sender', 'a'])
        eventLogs[0].topics.sender.should.amorphEqual(personas[0].address, 'hex')
        eventLogs[0].topics.a.should.amorphEqual(one)
        eventLogs[1].topics.should.have.keys(['b', 'sender'])
        eventLogs[1].topics.b.should.amorphEqual(two)
        eventLogs[1].topics.sender.should.amorphEqual(personas[0].address, 'hex')
      })
    })
  })

})

module.exports = eventsContract
