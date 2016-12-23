const Amorph = require('../lib/Amorph')
const Ultralightbeam = require('../')
const TestRPC = require('ethereumjs-testrpc')
const personas = require('../modules/personas')

const ultralightbeam = new Ultralightbeam(TestRPC.provider({
  blocktime: 2,
  accounts: personas.map((persona) => {
    return {
      balance: persona.balance.to('number'),
      secretKey: persona.privateKey.to('hex.prefixed')
    }
  })
}))

ultralightbeam.defaults.from = personas[0]

module.exports = ultralightbeam
