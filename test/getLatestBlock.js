const ultralightbeam = require('./ultralightbeam')
const Block = require('../lib/Block')
const TransactionRequest = require('../lib/TransactionRequest')
const accounts = require('./accounts')
const amorphNumber = require('amorph-number')
const Amorph = require('amorph')

describe('getLatestBlock', () => {
  let block
  it('should getLatestBlock', () => {
    return ultralightbeam.getLatestBlock().then((_block) => {
      _block.should.be.instanceOf(Block)
      block = _block
    })
  })
  it('should do a transaction', () => {
    return (new TransactionRequest(ultralightbeam, {
      from: accounts[0],
      to: accounts[1].address,
      value: Amorph.from(amorphNumber.unsigned, 1)
    })).send().getConfirmation()
  })
  it('should getLatestBlock', () => {
    return ultralightbeam.getLatestBlock().then((_block) => {
      _block.should.be.instanceOf(Block)
      _block.timestamp.should.not.amorphEqual(block.timestamp)
    })
  })
})
