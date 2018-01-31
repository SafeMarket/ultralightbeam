const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

module.exports = new Interface('estimateGas', 'eth_estimateGas', {
  inputter: defunction([v.transactionRequestish], v.array, function inputter(transactionRequest) {
    return [transactionRequest.toPojo()]
  }),
  outputter: defunction([v.prefixedHex], v.amorph, function outputter(result) {
    return Amorph.from(amorphHex.prefixed, result)
  })
})
