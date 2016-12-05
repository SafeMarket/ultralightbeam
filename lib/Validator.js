const createTestableErrorClass = require('testable-error')

module.exports = function Validator(name, description, test) {
  this.test = test
  this.Error = createTestableErrorClass(
    `${name} ValidationError`,
    `Expected %s to be ${description} but recieved %s`
  )
}