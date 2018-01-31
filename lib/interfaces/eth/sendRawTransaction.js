const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = new Interface('sendRawTransaction', 'eth_sendRawTransaction', {
  inputter: defunction([v.amorph], v.array, function inputter(signedRawTransaction) {
    return [signedRawTransaction.to(amorphHex.prefixed)]
  }),
  outputter: defunction([v.prefixedHex], v.amorph, function outputter(result) {
    return Amorph.from(amorphHex.prefixed, result)
  })
})
