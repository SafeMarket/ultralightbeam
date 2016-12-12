const Persona = require('../modules/Persona')
const ultralightbeam = require('./ultralightbeam')
const TransactionRequest = require('../lib/TransactionRequest')
const Amorph = require('../lib/Amorph')

describe('locked account', () => {

  const persona = new Persona()

  it('sendTransaction should be rejected', () => {
    return ultralightbeam.eth.sendTransaction(new TransactionRequest({
      from: persona.address,
      to: persona.address,
      value: new Amorph(1, 'number')
    })).should.be.rejected
  })

})