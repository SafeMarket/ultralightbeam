const createTestableErrorClass = require('testable-error')

module.exports = {
  ArgumentsLengthError: createTestableErrorClass(
    'ArgumentsLengthError',
    '%s expected %u arguments but received %u'
  ),
  NoTransactionRequestError: createTestableErrorClass(
    'NoTransactionRequestError',
    'Cannot set %s since there is no transaction request'
  ),
  NoResultReturnedError: createTestableErrorClass(
    'NoResultReturnedError',
    'No result returned for request #%u'
  )
}
