const Validator = require('../Validator')
const transactionRequestFields = require('../transactionRequestFields')

module.exports = new Validator(
  'Transaction request field',
  'a transaction request field',
  (arg) => {
    return arg in transactionRequestFields
  }
)
