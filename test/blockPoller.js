const Amorph = require('../lib/Amorph')
const BlockPoller = require('../lib/BlockPoller')
const Block = require('../lib/Block')
const TransactionRequest = require('../lib/TransactionRequest')
const ultralightbeam = require('./ultralightbeam')
const personas = require('../modules/personas')

describe('blockPoller', () => {

  const blocks = []
  const dummyTransaction = new TransactionRequest({
    to: personas[0].address,
    value: new Amorph(1, 'number')
  })
  let blockNumber
  let block

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
    ultralightbeam.blockPoller.promise.then((_block) => {
      block = _block
    })
    return ultralightbeam.sendTransaction(dummyTransaction)
  })

  it('block should be instance of Block', () => {
    block.should.be.instanceOf(Block)
  })

  it('block.number should be blockNumber + 1', () => {
    block.number.to('number').should.equal(blockNumber.to('number') + 1)
  })

  it('should send another dummy Transaction', () => {
    ultralightbeam.sendTransaction(dummyTransaction)
    return ultralightbeam.blockPoller.promise.should.be.fulfilled
  })

  it('blocks should be array of block #1 and block # 2', () => {
    blocks.should.have.length(2)
    blocks[0].should.be.instanceOf(Block)
    blocks[1].should.be.instanceOf(Block)
    blocks[0].number.should.amorphTo('number').equal(
      blockNumber.to('number') + 1
    )
    blocks[1].number.should.amorphTo('number').equal(
      blockNumber.to('number') + 2
    )
  })

})
