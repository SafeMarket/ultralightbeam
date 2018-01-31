const secp256k1 = require('secp256k1')
const sha3 = require('js-sha3')
const defunction = require('defunction')
const v = require('./validates')
const Amorph = require('amorph')
const getRandomAmorph = require('./getRandomAmorph')

const Account = module.exports = defunction([v.privateKey], v.undefined, function Account(privateKey) {
  this.privateKey = privateKey

  const uncompressedPublicKeyUint8Array = new Uint8Array(secp256k1.publicKeyCreate(privateKey.uint8Array, false))
  const compressedPublicKeyUint8Array = new Uint8Array(secp256k1.publicKeyCreate(privateKey.uint8Array, true))
  const addressUint8Array = new Uint8Array(sha3.keccak256.array(uncompressedPublicKeyUint8Array.slice(1)).slice(-20))

  this.address = new Amorph(addressUint8Array)
  this.publicKey = {
    compressed: new Amorph(compressedPublicKeyUint8Array),
    uncompressed: new Amorph(uncompressedPublicKeyUint8Array)
  }
})

Account.generate = defunction([], v.account, function generate() {
  let privateKey
  do {
    privateKey = getRandomAmorph(32)
  } while (!secp256k1.privateKeyVerify(privateKey.uint8Array))

  return new Account(privateKey)
})

Account.prototype.sign
