const BlockPoller = require('../lib/BlockPoller')
const Block = require('../lib/Block')
const TransactionRequest = require('../lib/TransactionRequest')
const ultralightbeam = require('./ultralightbeam')
const accounts = require('./accounts')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')

describe('blockPoller', () => {

  const blocks = []
  let dummyTransaction
  let blockNumber
  let block

  it('should create dummy transaction', () => {
    dummyTransaction = new TransactionRequest(ultralightbeam, {
      to: accounts[0].address,
      value: Amorph.from(amorphNumber.unsigned, 1)
    })
  })

  it('should be instance of BlockPoller', () => {
    ultralightbeam.blockPoller.should.be.instanceOf(BlockPoller)
  })

  it('should get current blockNumber', () => {
    return ultralightbeam.eth.getBlockNumber().then((_blockNumber) => {
      blockNumber = _blockNumber
    })
  })

  it('should listen to "block" event', () => {
    ultralightbeam.blockPoller.emitter.on('block', (_block) => {
      blocks.push(_block)
    })
  })

  it('should wait for promise to be fulfilled', () => {
    ultralightbeam.blockPoller.blockPromise.then((_block) => {
      block = _block
    })
    return dummyTransaction.send().getTransaction()
  })


  it('block should be instance of Block', () => {
    block.should.be.instanceOf(Block)
  })

  it('block should be attached to blockPoller as blockPoller.block', () => {
    block.should.equal(ultralightbeam.blockPoller.block)
  })

  it('block.number should be blockNumber + 1', () => {
    block.number.to(amorphNumber.unsigned).should.equal(blockNumber.to(amorphNumber.unsigned) + 1)
  })

  it('should send another dummy Transaction', () => {
    dummyTransaction.send()
    return ultralightbeam.blockPoller.blockPromise.should.be.fulfilled
  })

  it('blocks should be array of block #1 and block # 2', () => {
    blocks.should.have.length(2)
    blocks[0].should.be.instanceOf(Block)
    blocks[1].should.be.instanceOf(Block)
    blocks[0].number.should.amorphTo(amorphNumber.unsigned).equal(
      blockNumber.to(amorphNumber.unsigned) + 1
    )
    blocks[1].number.should.amorphTo(amorphNumber.unsigned).equal(
      blockNumber.to(amorphNumber.unsigned) + 2
    )
  })

  it('blockPoller.gasPrice should be 2 Szabo', () => {
    const twoSzabo = 20000000000
    ultralightbeam.blockPoller.gasPrice.should.amorphTo(amorphNumber.unsigned).equal(twoSzabo)
  })

  // ToDo: test gasPrice event (doesn't look like there's a way to trigger it in testrpc)

})
