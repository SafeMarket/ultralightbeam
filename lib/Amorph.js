const Amorph = require('amorph')

Amorph.loadPlugin(require('amorph-hex'))
Amorph.loadPlugin(require('amorph-base58'))
Amorph.loadPlugin(require('amorph-bignumber'))
Amorph.loadPlugin(require('amorph-buffer'))
Amorph.crossConverter.addConverter('boolean', 'web3.bool', (boolean) => {
  return boolean
})
Amorph.crossConverter.addConverter('web3.bool', 'boolean', (web3Bool) => {
  return web3Bool
})
Amorph.crossConverter.addConverter('hex.prefixed', 'web3.address', (hexPrefixed) => {
  return hexPrefixed
})
Amorph.crossConverter.addConverter('web3.address', 'hex.prefixed', (web3Address) => {
  return web3Address
})
Amorph.crossConverter.addConverter('hex.prefixed', 'web3.bytes', (hexPrefixed) => {
  return hexPrefixed
})
Amorph.crossConverter.addConverter('web3.bytes', 'hex.prefixed', (web3Bytes) => {
  return web3Bytes
})
Amorph.crossConverter.addConverter('hex.prefixed', 'web3.bytes', (hexPrefixed) => {
  return hexPrefixed
})

Amorph.crossConverter.addConverter('hex.prefixed', 'web3.string', (hexPrefixed) => {
  return hexPrefixed
})
Amorph.crossConverter.addConverter('web3.string', 'ascii', (web3String) => {
  return web3String
})
Amorph.crossConverter.addConverter('bignumber', 'web3.int', (bignumber) => {
  return bignumber
})
Amorph.crossConverter.addConverter('web3.int', 'bignumber', (web3Int) => {
  return web3Int
})
Amorph.crossConverter.addConverter('bignumber', 'web3.uint', (bignumber) => {
  return bignumber
})
Amorph.crossConverter.addConverter('web3.uint', 'bignumber', (web3Uint) => {
  return web3Uint
})

Amorph.crossConverter.addPath(['buffer', 'hex', 'bignumber', 'number'])
Amorph.crossConverter.addPath(['buffer', 'hex', 'hex.prefixed'])
Amorph.crossConverter.addPath(['uint8Array', 'array', 'hex', 'hex.prefixed'])
Amorph.crossConverter.addPath(['array', 'hex', 'hex.prefixed'])
Amorph.crossConverter.addPath(['hex.prefixed', 'hex', 'bignumber', 'number'])
Amorph.crossConverter.addPath(['bignumber', 'hex', 'hex.prefixed'])
Amorph.crossConverter.addPath(['hex.prefixed', 'hex', 'array'])
Amorph.crossConverter.addPath(['ascii', 'buffer', 'hex', 'hex.prefixed', 'web3.bytes'])
Amorph.crossConverter.addPath(['web3.address', 'hex.prefixed', 'hex', 'array'])
Amorph.crossConverter.addPath(['web3.address', 'hex.prefixed', 'hex'])
Amorph.crossConverter.addPath(['uint8Array', 'array', 'hex', 'hex.prefixed', 'web3.address'])
Amorph.crossConverter.addPath(['web3.address', 'hex.prefixed', 'hex', 'bignumber', 'number'])
Amorph.crossConverter.addPath(['hex', 'bignumber', 'number'])
Amorph.crossConverter.addPath(['uint8Array', 'array', 'hex'])
Amorph.crossConverter.addPath(['number', 'bignumber', 'hex', 'hex.prefixed'])
Amorph.crossConverter.addPath(['web3.uint', 'bignumber', 'number'])
Amorph.crossConverter.addPath(['number', 'bignumber', 'web3.uint'])
Amorph.crossConverter.addPath(['buffer', 'hex', 'hex.prefixed', 'web3.bytes'])
Amorph.crossConverter.addPath(['web3.bytes', 'hex.prefixed', 'hex'])

Amorph.equivalenceTests['web3.uint'] = function web3UintEquivalenceTest(a, b) {
  return a.equals(b)
}

module.exports = Amorph
