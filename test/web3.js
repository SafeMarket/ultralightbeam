const ultralightbeam = require('./ultralightbeam')

describe('web3', () => {

  describe('getClientVersion', () => {

    let clientVersion

    it('should be fulfilled', () => {
      return ultralightbeam.web3.getClientVersion().then((_clientVersion) => {
        clientVersion = _clientVersion
      }).should.be.fulfilled
    })

    it('clientVersion should be a string"', () => {
      clientVersion.should.be.a('string')
    })

    it('clientVersion should start with "Etheruemjs Testrpc"', () => {
      clientVersion.indexOf('EthereumJS TestRPC').should.equal(0)
    })

  })

  describe('sha3', () => {

    let ciphertext

    it('should return ciphertext', () => {
      const plaintext = new ultralightbeam.Amorph('0x68656c6c6f20776f726c64', 'hex.prefixed')
      return ultralightbeam.web3.sha3(plaintext).then((_ciphertext) => {
        ciphertext = _ciphertext
      }).should.be.fulfilled
    })

    it('ciphertext should be instance of Amorph"', () => {
      ciphertext.should.be.instanceof(ultralightbeam.Amorph)
    })

    it('ciphertext should be correct"', () => {
      ciphertext.to('hex.prefixed').should.equal(
        '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'
      )
    })

  })

})
