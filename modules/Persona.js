const Amorph = require('../lib/Amorph')
const util = require('ethereumjs-util')
const crypto = require('crypto')

function Account(privateKey, balance) {
  this.privateKey = privateKey || new Amorph(crypto.randomBytes(32), 'buffer')
  const addressBuffer = util.privateToAddress(this.privateKey.to('buffer'))
  this.address = new Amorph(addressBuffer, 'buffer')
  this.balance = balance || new Amorph(1000000000000000000, 'number')
}

module.exports = Account