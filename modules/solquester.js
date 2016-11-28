const Amorph = require('./Amorph')
const Solquester = require('../lib/Solquester')
const TestRPC = require('ethereumjs-testrpc')
const solquester = new Solquester(TestRPC.provider({
  blocktime: 1
}))
solquester.defaults.gas = new Amorph(3000000, 'number')
module.exports = solquester