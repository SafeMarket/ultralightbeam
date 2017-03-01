const Validator = require('../Validator')
const Account = require('ethereum-account-amorph')

module.exports = new Validator('Account', 'instance of Account', (arg) => {
  return arg instanceof Account
})
