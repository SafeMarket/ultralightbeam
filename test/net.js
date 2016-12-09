const ultralightbeam = require('./ultralightbeam')
const Amorph = require('../lib/Amorph')

describe('net', () => {

  describe('getListening', () => {
    it('should be true', () => {
      return ultralightbeam.net.getListening().should.eventually.equal(true)
    })
  })

  describe('getPeerCount', () => {
    it('should be 0', () => {
      return ultralightbeam.net.getPeerCount().should.eventually.equal(0)
    })
  })

  describe('getVersion', () => {
    it('should be a string', () => {
      return ultralightbeam.net.getVersion().should.eventually.be.a('string')
    })
  })

})
