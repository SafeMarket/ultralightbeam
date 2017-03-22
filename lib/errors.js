const createTestableErrorClass = require('testable-error')

module.exports = {
  ArgumentsLengthError: createTestableErrorClass(
    'ArgumentsLengthError'
  ),
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
  )
}
