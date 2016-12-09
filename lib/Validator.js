const createTestableErrorClass = require('testable-error')
const errors = require('./errors')

function Validator(name, description, test) {
  this.name = name
  this.test = test
  this.Error = createTestableErrorClass(
    `${name} ValidationError`,
    `Expected %s to be ${description} but recieved %s`
  )
}

Validator.prototype.validate = function validate(expectation, value) {
  if(arguments.length !== 2) {
    throw new errors.ArgumentsLengthError(
      'Validator.validate', 2, arguments.length
    )
  }
  if (!this.test(value)) {
    throw new this.Error(expectation, value)
  }
}

module.exports = Validator
