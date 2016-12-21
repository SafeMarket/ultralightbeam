const Amorph = require('amorph')
Amorph.loadConverters(require('amorph-hex'))
Amorph.loadConverters(require('amorph-base58'))
Amorph.loadConverters(require('amorph-bignumber'))
Amorph.loadConverters(require('amorph-buffer'))
Amorph.loadConverter('boolean', 'web3.bool', (boolean) => {
  return boolean
})
Amorph.loadConverter('web3.bool', 'boolean', (web3Bool) => {
  return web3Bool
})
Amorph.loadConverter('hex.prefixed', 'web3.address', (hexPrefixed) => {
  return hexPrefixed
})
Amorph.loadConverter('web3.address', 'hex.prefixed', (web3Address) => {
  return web3Address
})
Amorph.loadConverter('hex.prefixed', 'web3.bytes', (hexPrefixed) => {
  return hexPrefixed
})
Amorph.loadConverter('web3.bytes', 'hex.prefixed', (web3Bytes) => {
  return web3Bytes
})
Amorph.loadConverter('hex.prefixed', 'web3.bytes32', (hexPrefixed) => {
  return hexPrefixed
})

Amorph.loadConverter('hex.prefixed', 'web3.string', (hexPrefixed) => {
  return hexPrefixed
})
Amorph.loadConverter('web3.string', 'ascii', (web3String) => {
  return web3String
})
Amorph.loadConverter('bignumber', 'web3.int256', (bignumber) => {
  return bignumber
})
Amorph.loadConverter('web3.int', 'bignumber', (web3Int) => {
  return web3Int
})
Amorph.loadConverter('bignumber', 'web3.uint256', (bignumber) => {
  return bignumber
})
Amorph.loadConverter('web3.uint', 'bignumber', (web3Uint) => {
  return web3Uint
})
Amorph.ready()

module.exports = Amorph
