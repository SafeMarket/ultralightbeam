const Amorph = require('../../Amorph')
const Interface = require('../../Interface')

module.exports = new Interface('start', 'miner_start', {
  inputterValidators: [
    require('../../validators/integer')
  ],
  inputter: function inputter(threadCount) {
    return [threadCount]
  }
})
