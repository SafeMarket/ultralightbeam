const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const SolWrapper = require('../lib/SolWrapper')
const amorphParseSolcOutput = require('./parseSolcOutput')
const accounts = require('./accounts')
const crypto = require('crypto')

const eventsContractSol =
  `pragma solidity ^0.4.4;
  contract Events {
    event Creation(uint256 blockNumber, uint256 timestamp);

    event A(address sender, uint256 a);
    event B(uint256 b, address sender);
    event C(bytes5 tag, bytes32 hash);

    function Events() payable {
      Creation(block.number, now);
    }

    function doThing(uint256 a, uint256 b) {
      A(msg.sender, a);
      B(b, msg.sender);
    }

    function tag(bytes5 tag, bytes32 hash) {
      C(tag, hash);
    }
  }`

const eventsContractInfo = amorphParseSolcOutput(solc.compile(eventsContractSol, 1)).Events

function random(length) {
  return new ultralightbeam.Amorph(crypto.randomBytes(length), 'buffer')
}

describe('eventsContract', () => {
  let eventsContract
  describe('deploy', () => {
    let eventLogs
    it('should be fulfilled', () => {
      const transactionRequest = new SolDeployTransactionRequest(
        ultralightbeam, eventsContractInfo.code, eventsContractInfo.abi, [], {}
      )
      const transactionMonitor = transactionRequest.send()
      return transactionMonitor.getTransactionReceipt().then((
        transactionReceipt
      ) => {
        eventsContract = new SolWrapper(
          ultralightbeam, eventsContractInfo.abi, transactionReceipt.contractAddress
        )
        eventLogs = eventsContract.parseTransactionReceipt(transactionReceipt)
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
      const one = new ultralightbeam.Amorph(1, 'number')
      const two = new ultralightbeam.Amorph(2, 'number')
      return eventsContract.broadcast('doThing(uint256,uint256)', [
        one, two
      ], {}).getTransactionReceipt().then((transactionReceipt) => {
        const eventLogs = eventsContract.parseTransactionReceipt(transactionReceipt)
        eventLogs.should.have.length(2)
        eventLogs[0].values.should.have.length(2)
        eventLogs[0].values[0].should.amorphEqual(accounts[0].address, 'hex')
        eventLogs[0].values[1].should.amorphEqual(one)
        eventLogs[1].values.should.have.length(2)
        eventLogs[1].values[0].should.amorphEqual(two)
        eventLogs[1].values[1].should.amorphEqual(accounts[0].address, 'hex')
        eventLogs[0].topics.should.have.keys(['sender', 'a'])
        eventLogs[0].topics.sender.should.amorphEqual(accounts[0].address, 'hex')
        eventLogs[0].topics.a.should.amorphEqual(one)
        eventLogs[1].topics.should.have.keys(['b', 'sender'])
        eventLogs[1].topics.b.should.amorphEqual(two)
        eventLogs[1].topics.sender.should.amorphEqual(accounts[0].address, 'hex')
      })
    })
  })

  describe('tag()', () => {
    it('should emit correct events', () => {
      const tag = random(5)
      const hash = random(32)
      return eventsContract.broadcast('tag(bytes5,bytes32)', [
        tag, hash
      ], {}).getTransactionReceipt().then((transactionReceipt) => {
        const eventLogs = eventsContract.parseTransactionReceipt(transactionReceipt)
        eventLogs.should.have.length(1)

        eventLogs[0].topics.should.have.keys(['tag', 'hash'])
        eventLogs[0].topics.tag.should.amorphEqual(tag, 'hex')
        eventLogs[0].topics.hash.should.amorphEqual(hash, 'hex')
      })
    })
  })

})
