const Interface = require('../../Interface')
const countingNumberValidator = require('../../validators/countingNumber')

module.exports = new Interface('start', 'miner_start', [countingNumberValidator], {
  inputter: function inputter(threadCount) {
    return [threadCount]
  }
})
