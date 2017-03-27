const _ = require('lodash')
const Amorph = require('./Amorph')
const arguguard = require('arguguard')

module.exports = function SolidityOutput(result) {
  arguguard('SolidityOutput', [Object], arguments)
  _.merge(this, result)
  this.code = new Amorph(result.code, result.code.indexOf('0x') === 0 ?
    'hex.prefixed' : 'hex')
}
