const _ = require('lodash')
const arguguard = require('arguguard')

module.exports = function SolidityOutput(ultralightbeam, result) {
  arguguard('SolidityOutput', ['Ultralightbeam', 'Object'], arguments)
  _.merge(this, result)
  this.code = new ultralightbeam.Amorph(result.code, result.code.indexOf('0x') === 0 ?
    'hex.prefixed' : 'hex')
}
