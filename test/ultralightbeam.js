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
ultralightbeam.defaults.gas = new Amorph(1000000, 'number')

describe('ultralightbeam', () => {

  it('should set ultralightbeam.defaults.from', () => {
    return ultralightbeam
      .eth.getAccounts()
      .then((_accounts) => {
        ultralightbeam.defaults.from = personas[0]
      }).should.be.fulfilled
  })

})

module.exports = ultralightbeam
