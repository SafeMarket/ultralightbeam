const Validator = require('arguguard/lib/Validator')
const transactionRequestFields = require('../transactionRequestFields')
const _ = require('lodash')

module.exports = new Validator('TransactionRequestField', (arg) => {
  if (!_.has(transactionRequestFields, arg)) {
    throw new Error(`should be a TransactionRequest field, received "${arg}"`)
  }
})
