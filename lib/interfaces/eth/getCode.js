const Interface = require('../../Interface')
const blockFlags = require('../../blockFlags')
const defunction = require('defunction')
const v = require('../../validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = new Interface('getCode', 'eth_getCode', {
  inputter: defunction([v.address], v.array, function inputter(address) {
    return [address.to(amorphHex.prefixed), blockFlags.latest.toParam()]
  }),
  outputter: defunction([v.string], v.amorph, function outputter(_result) {
    // TODO: resolve https://github.com/trufflesuite/ganache-core/issues/51
    const result = (_result === '0x0') ? '0x' : _result
    return Amorph.from(amorphHex.prefixed, result)
  })
})
