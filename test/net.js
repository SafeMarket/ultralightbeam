const solquester = require('./solquester')
const Amorph = require('../lib/Amorph')

describe('net', () => {

  describe('getListening', () => {

    it('should be true', () => {
      return solquester.net.getListening().should.eventually.equal(true)
    })

  })

  describe('getPeerCount', () => {

    it('should be 0', () => {
      return solquester.net.getPeerCount().should.eventually.equal(0)
    })
    
  })

  describe('getVersion', () => {

    it('should be a string', () => {
      return solquester.net.getVersion().should.eventually.be.a('string')
    })
    
  })

})