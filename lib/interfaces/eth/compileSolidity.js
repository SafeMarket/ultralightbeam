const SolidityOutput = require('../../SolidityOutput')
const Interface = require('../../Interface')

module.exports = new Interface('compileSolidity', 'eth_compileSolidity', ['string'], {
  inputter: function inputter(sol) {
    return [sol]
  },
  outputter: function outputter(result) {
    return new SolidityOutput(this, result)
  }
})
