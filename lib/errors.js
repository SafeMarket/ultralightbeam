const createTestableErrorClass = require('testable-error')

module.exports = {
  NoTransactionRequestError: createTestableErrorClass(
    'NoTransactionRequestError'
  ),
  NoResultReturnedError: createTestableErrorClass(
    'NoResultReturnedError'
  ),
  NotPollingError: createTestableErrorClass(
    'NotPollingError'
  ),
  BlocksWaitedError: createTestableErrorClass(
    'BlocksWaitedError'
  ),
  OOGError: createTestableErrorClass(
    'OOGError'
  ),
  TransactionReceiptParseError: createTestableErrorClass(
    'TransactionReceiptParseError'
  ),
  ContractDeploymentError: createTestableErrorClass(
    'ContractDeploymentError'
  ),
  NoFromError: createTestableErrorClass(
    'NoFromError'
  ),
  ExceedsBlockLimitError: createTestableErrorClass(
    'ExceedsBlockLimitError'
  ),
  BalanceTooLowError: createTestableErrorClass(
    'BalanceTooLowError'
  ),
  InvalidTransactionRequestFieldError: createTestableErrorClass(
    'InvalidTransactionRequestFieldError'
  ),
  MissingFromError: createTestableErrorClass(
    'MissingFromError'
  ),
  MissingNonceError: createTestableErrorClass(
    'MissingNonceError'
  )
}
