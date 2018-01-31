const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const defunction = require('defunction')
const v = require('../../validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = new Interface('getStorageAt', 'eth_getStorageAt', {
  inputter: defunction([v.address, v.word], v.array, function inputter(address, key) {
    return [
      address.to(amorphHex.prefixed), key.to(amorphHex.prefixed), blockFlags.latest.toParam()
    ]
  }),
  outputter: defunction([v.prefixedHex], v.amorph, function outputter(result) {
    return Amorph.from(amorphHex.prefixed, result)
  })
})
