const _ = require('lodash')
const Account = require('ethereum-account-amorph')
const random = require('random-amorph')

module.exports = _.range(10).map(() => {
  const account = Account.generate()
  account.balance = random(16)
  return account
})
