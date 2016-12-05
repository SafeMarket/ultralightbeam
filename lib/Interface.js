const _ = require('lodash')
const requireDirectory = require('require-directory')
const validators = requireDirectory(module, './validators')

module.exports = function Interface(pojo) {
  _.merge(this, pojo)
  this.inputterValidatorNames = pojo.inputterValidatorNames || []
  this.inputterValidators = this.inputterValidatorNames.map((inputterValidatorName) => {
    return validators[inputterValidatorName]
  })
}