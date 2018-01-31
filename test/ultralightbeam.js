const Ultralightbeam = require('../')
const ganache = require('ganache-cli')
const accounts = require('./accounts')
const account = require('./account')
const amorphNumber = require('amorph-number')
const amorphHex = require('amorph-hex')

const gasLimit = 8000000

const provider = ganache.provider({
  gasPrice: 20000000000,
  gasLimit: gasLimit,
  blocktime: 2,
  accounts: accounts.map((_account) => {
    return {
      balance: _account.balance.to(amorphNumber.unsigned),
      secretKey: _account.privateKey.to(amorphHex.prefixed)
    }
  })
})
const ultralightbeam = new Ultralightbeam(provider, {
  defaultAccount: account
})

module.exports = ultralightbeam
