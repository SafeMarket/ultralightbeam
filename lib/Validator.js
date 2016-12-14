const createTestableErrorClass = require('testable-error')

function Validator(name, description, test) {
  this.name = name
  this.test = test
  this.Error = createTestableErrorClass(
    `${name} ValidationError`,
    `Expected %s to be ${description} but recieved %s`
  )
}

// eslint-disable-next-line max-len
Validator.prototype.validate = function validate(expectation, value, isOptional) {
  if(isOptional === true && value === undefined) {
    return
  }
  if (!this.test(value)) {
    throw new this.Error(expectation, value)
  }
}

module.exports = Validator
