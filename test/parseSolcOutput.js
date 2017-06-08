const amorphParseSolcOutput = require('amorph-parse-solc-output')
const ultralightbeam = require('./ultralightbeam')

module.exports = function parseSolcOutput(output) {
  return amorphParseSolcOutput(output, ultralightbeam.Amorph)
}
