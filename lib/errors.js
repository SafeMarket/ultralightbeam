module.exports = {
  validators: {
    amorph: createTestableErrorClass(
      'AmorphValidationError',
      '"%s" argument #%n should be instance of Amorph'
    ),
    transactionRequest: createTestableErrorClass(
      'TransactionRequestValidationError',
      '"%s" argument #%n should be instance of TransactionRequest'
    ),
    blockFlag: createTestableErrorClass(
      'BlockFlagValidationError',
      '"%s" argument #%n should be instance of BlockFlag'
    ),
    string: createTestableErrorClass(
      'StringValidationError',
      '"%s" argument #%n should be a string'
    )
    boolean: createTestableErrorClass(
      'BooleanValidationError',
      '"%s" argument #%n should be a boolean'
    )
  }
}