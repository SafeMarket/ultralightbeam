const Amorph = require('./Amorph')
const util = require('ethereumjs-util')
const crypto = require('crypto')

function Persona(privateKey) {
  this.privateKey = privateKey || new Amorph(crypto.randomBytes(32), 'buffer')
  const addressBuffer = util.privateToAddress(this.privateKey.to('buffer'))
  this.address = new Amorph(addressBuffer, 'buffer')
}

module.exports = Persona
