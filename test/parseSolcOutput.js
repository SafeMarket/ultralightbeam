const amorphParseSolcOutput = require('amorph-parse-solc-output')
const Amorph = require('../lib/Amorph')

module.exports = function parseSolcOutput(output) {
  return amorphParseSolcOutput(output, Amorph)
}
