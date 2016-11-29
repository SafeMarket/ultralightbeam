const solquester = require('./solquester')
const Amorph = require('../modules/Amorph')

describe('net', () => {

  describe('getListening', () => {

    it('should be true', () => {
      return solquester.net.getListening().promise.should.eventually.equal(true)
    })

  })

  describe('getPeerCount', () => {

    it('should be 0', () => {
      return solquester.net.getPeerCount().promise.should.eventually.equal(0)
    })
    
  })

  describe('getVersion', () => {

    it('should be a string', () => {
      return solquester.net.getVersion().promise.should.eventually.be.a('string')
    })
    
  })

})