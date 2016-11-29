const solquester = require('./solquester')

describe('miner', () => {

  it('should be mining', () => {
    return solquester.eth.getMining().promise.should.eventually.equal(true)
  })

  it('should stop', () => {
    return solquester.miner.stop().promise.should.be.fulfilled
  })

  it('should not be mining', () => {
    return solquester.eth.getMining().promise.should.eventually.equal(false)
  })

  it('should start', () => {
    return solquester.miner.start(1).promise.should.be.fulfilled
  })

  it('should be mining', () => {
    return solquester.eth.getMining().promise.should.eventually.equal(true)
  })

})