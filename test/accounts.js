const _ = require('lodash')
const Account = require('ethereum-account-amorph')
const Amorph = require('./Amorph')
const random = require('random-amorph')

module.exports = _.range(10).map(() => {
  const account = Account.generate(Amorph)
  account.balance = random(Amorph, 16)
  return account
})
