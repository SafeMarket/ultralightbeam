const Persona = require('../lib/Persona')
const _ = require('lodash')
const Amorph = require('../lib/Amorph')

module.exports = _.range(10).map(() => {
  const persona = new Persona
  const balanceInt = 5000000 + persona.privateKey.to('array')[0]
  persona.balance = new Amorph(balanceInt, 'number')
  return persona
})
