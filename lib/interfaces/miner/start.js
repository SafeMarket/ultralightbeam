const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'miner_start',
  inputValidators: ['integer'],
  inputter: function (threadCount) {
    return [threadCount]
  }
}