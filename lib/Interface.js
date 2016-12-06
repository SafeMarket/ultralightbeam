const _ = require('lodash')
const bulk = require('bulk-require')
const validators = bulk(__dirname+'/validators', [ '**/*.js' ])

module.exports = function Interface(pojo) {
  _.merge(this, pojo)
  this.inputterValidatorNames = pojo.inputterValidatorNames || []
  this.inputterValidators = this.inputterValidatorNames.map((inputterValidatorName) => {
    return validators[inputterValidatorName]
  })
}