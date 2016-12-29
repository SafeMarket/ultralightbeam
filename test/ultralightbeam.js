const Ultralightbeam = require('../')
const TestRPC = require('ethereumjs-testrpc')
const personas = require('../modules/personas')
const persona = require('../modules/persona')

const provider = TestRPC.provider({
  blocktime: 2,
  accounts: personas.map((_persona) => {
    return {
      balance: _persona.balance.to('number'),
      secretKey: _persona.privateKey.to('hex.prefixed')
    }
  })
})
const ultralightbeam = new Ultralightbeam(provider, {
  transactionApprover: (transactionRequest, gas) => {
    transactionRequest.set('gas', gas)
    transactionRequest.set('from', persona)
    return ultralightbeam.resolve(transactionRequest)
  }
})

module.exports = ultralightbeam
