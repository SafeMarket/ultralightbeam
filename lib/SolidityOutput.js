const _ = require('lodash')
const Amorph = require('./Amorph')

module.exports = function SolidityOutput (result) {
  _.merge(this, result)
  this.code = new Amorph(result.code, 'hex')
}