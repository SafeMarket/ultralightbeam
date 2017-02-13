const Amorph = require('./Amorph')
const util = require('ethereumjs-util')
const crypto = require('crypto')

function Persona(privateKey) {
  this.privateKey = privateKey || new Amorph(crypto.randomBytes(32), 'buffer')
  const publicKeyBuffer = util.privateToPublic(this.privateKey.to('buffer'))
  this.publicKey = new Amorph(publicKeyBuffer, 'buffer')
  const addressBuffer = util.publicToAddress(publicKeyBuffer)
  this.address = new Amorph(addressBuffer, 'buffer')
}

module.exports = Persona
