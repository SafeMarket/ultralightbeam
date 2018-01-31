const _ = require('lodash')
const Account = require('../lib/Account')
const getRandomAmorph = require('../lib/getRandomAmorph')

module.exports = _.range(10).map(() => {
  const account = Account.generate()
  account.balance = getRandomAmorph(16)
  return account
})
