const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const SolWrapper = require('../lib/SolWrapper')
const parseSolcOutput = require('../lib/parseSolcOutput')
const accounts = require('./accounts')
const getRandomAmorph = require('../lib/getRandomAmorph')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')

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

const eventsContractInfo = parseSolcOutput(solc.compile(eventsContractSol, 1)).Events

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
      eventLogs[0].values[0].should.amorphEqual(ultralightbeam.blockPoller.block.number)
      eventLogs[0].values[1].should.amorphEqual(ultralightbeam.blockPoller.block.timestamp)
      eventLogs[0].topics.should.have.keys(['blockNumber', 'timestamp'])
      eventLogs[0].topics.blockNumber.should.amorphEqual(ultralightbeam.blockPoller.block.number)
      eventLogs[0].topics.timestamp.should.amorphEqual(ultralightbeam.blockPoller.block.timestamp)
    })

  })

  describe('doThing()', () => {
    it('should emit correct events', () => {
      const one = Amorph.from(amorphNumber.unsigned, 1)
      const two = Amorph.from(amorphNumber.unsigned, 2)
      return eventsContract.broadcast('doThing(uint256,uint256)', [
        one, two
      ], {}).getTransactionReceipt().then((transactionReceipt) => {
        const eventLogs = eventsContract.parseTransactionReceipt(transactionReceipt)
        eventLogs.should.have.length(2)
        eventLogs[0].values.should.have.length(2)
        eventLogs[0].values[0].should.amorphEqual(accounts[0].address)
        eventLogs[0].values[1].should.amorphEqual(one)
        eventLogs[1].values.should.have.length(2)
        eventLogs[1].values[0].should.amorphEqual(two)
        eventLogs[1].values[1].should.amorphEqual(accounts[0].address)
        eventLogs[0].topics.should.have.keys(['sender', 'a'])
        eventLogs[0].topics.sender.should.amorphEqual(accounts[0].address)
        eventLogs[0].topics.a.should.amorphEqual(one)
        eventLogs[1].topics.should.have.keys(['b', 'sender'])
        eventLogs[1].topics.b.should.amorphEqual(two)
        eventLogs[1].topics.sender.should.amorphEqual(accounts[0].address)
      })
    })
  })

  describe('tag()', () => {
    it('should emit correct events', () => {
      const tag = getRandomAmorph(5)
      const hash = getRandomAmorph(32)
      return eventsContract.broadcast('tag(bytes5,bytes32)', [
        tag, hash
      ], {}).getTransactionReceipt().then((transactionReceipt) => {
        const eventLogs = eventsContract.parseTransactionReceipt(transactionReceipt)
        eventLogs.should.have.length(1)

        eventLogs[0].topics.should.have.keys(['tag', 'hash'])
        eventLogs[0].topics.tag.should.amorphEqual(tag)
        eventLogs[0].topics.hash.should.amorphEqual(hash)
      })
    })
  })

})
