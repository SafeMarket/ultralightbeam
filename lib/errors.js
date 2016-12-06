const createTestableErrorClass = require('testable-error')

module.exports = {
  ArgumentsLengthError: createTestableErrorClass('ArgumentsLengthError', '%s expected %u arguments but received %u')
}