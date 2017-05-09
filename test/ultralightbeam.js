const Ultralightbeam = require('../')
const TestRPC = require('ethereumjs-testrpc')
const accounts = require('./accounts')
const account = require('./account')
const Amorph = require('../lib/Amorph')

Amorph.ready()

const gasLimit = 4000000

const provider = TestRPC.provider({
  gasLimit: gasLimit,
  blocktime: 2,
  accounts: accounts.map((_account) => {
    return {
      balance: _account.balance.to('number'),
      secretKey: _account.privateKey.to('hex.prefixed')
    }
  })
})
const ultralightbeam = new Ultralightbeam(provider, {
  defaultAccount: account
})

module.exports = ultralightbeam
