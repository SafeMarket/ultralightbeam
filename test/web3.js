const solquester = require('../modules/solquester')
const Amorph = require('../modules/Amorph')

describe('web3', () => {

  describe('getClientVersion', () => {

    let clientVersion

    it('should be fulfilled', () => {
      return solquester.web3.getClientVersion().withHandler((_clientVersion) => {
        clientVersion = _clientVersion
      }).promise.should.be.fulfilled
    })

    it('clientVersion should be a string"', () => {
      clientVersion.should.be.a('string')
    })

    it('clientVersion should start with "Etheruemjs Testrpc"', () => {
      clientVersion.indexOf('EthereumJS TestRPC').should.equal(0)
    })

  })

  describe('getSha3', () => {

    let ciphertext

    it('should return ciphertext', () => {
      const plaintext = new Amorph('0x68656c6c6f20776f726c64', 'hex.prefixed')
      return solquester.web3.getSha3(plaintext).withHandler((_ciphertext) => {
        ciphertext = _ciphertext
      }).promise.should.be.fulfilled
    })

    it('ciphertext should be instance of Amorph"', () => {
      ciphertext.should.be.instanceof(Amorph)
    })

    it('ciphertext should be correct"', () => {
      ciphertext.to('hex.prefixed').should.equal('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad')
    })

  })

})