const Amorph = require('../lib/Amorph')
const util = require('ethereumjs-util')
const crypto = require('crypto')

function Persona(privateKey, balance) {
  this.privateKey = privateKey || new Amorph(crypto.randomBytes(32), 'buffer')
  const addressBuffer = util.privateToAddress(this.privateKey.to('buffer'))
  this.address = new Amorph(addressBuffer, 'buffer')
  const balanceInt = 5000000 + this.privateKey.to('array')[0]
  this.balance = balance || new Amorph(balanceInt, 'number')
}

module.exports = Persona
