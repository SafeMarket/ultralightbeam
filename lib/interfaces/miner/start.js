const Amorph = require('../../../modules/Amorph')
const Interface = require('../../Interface')

module.exports = new Interface({
  method: 'miner_start',
  inputterValidatorNames: ['integer'],
  inputter: function (threadCount) {
    return [threadCount]
  }
})