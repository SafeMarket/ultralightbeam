const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = new Interface('sha3', 'web3_sha3', {
  inputter: defunction([v.amorph], v.array, function inputter(data) {
    return [data.to(amorphHex.prefixed)]
  }),
  outputter: defunction([v.prefixedHex], v.amorph, function outputter(result) {
    return Amorph.from(amorphHex.prefixed, result)
  })
})
