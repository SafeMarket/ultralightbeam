const Persona = require('./Persona')
const _ = require('lodash')

module.exports = _.range(10).map(() => {
  return new Persona
})
