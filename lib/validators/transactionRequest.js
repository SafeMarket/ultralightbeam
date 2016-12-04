const Validator = require('../Validator')
const TransactionRequest = require('../TransactionRequest')

module.exports = new Validator('TransactionRequest', 'instance of TransactionRequest', (arg) => {
  arg instanceof TransactionRequest
})