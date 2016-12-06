const ultralightbeam = require('./ultralightbeam')

describe('miner', () => {

  it('should be mining', () => {
    return ultralightbeam.eth.getMining().should.eventually.equal(true)
  })

  it('should stop', () => {
    return ultralightbeam.miner.stop().should.be.fulfilled
  })

  it('should not be mining', () => {
    return ultralightbeam.eth.getMining().should.eventually.equal(false)
  })

  it('should start', () => {
    return ultralightbeam.miner.start(1).should.be.fulfilled
  })

  it('should be mining', () => {
    return ultralightbeam.eth.getMining().should.eventually.equal(true)
  })

})