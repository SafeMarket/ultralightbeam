const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const defunction = require('defunction')
const v = require('../../validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = new Interface('getTransactionCount', 'eth_getTransactionCount', {
  inputter: defunction([v.address], v.array, function inputter(address) {
    return [address.to(amorphHex.prefixed), blockFlags.latest.toParam()]
  }),
  outputter: defunction([v.prefixedHex], v.amorph, function outputter(result) {
    return Amorph.from(amorphHex.prefixed, result)
  })
})
