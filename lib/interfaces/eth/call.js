const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const defunction = require('defunction')
const v = require('../../validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = new Interface('call', 'eth_call', {
  inputter: defunction([v.transactionRequestish], v.array, function inputter(transactionRequest) {
    return [transactionRequest.toPojo(), blockFlags.latest.toParam()]
  }),
  outputter: defunction([v.prefixedHex], v.amorph, function outputter(result) {
    return Amorph.from(amorphHex.prefixed, result)
  })
})
