const SolidityOutput = require('../../SolidityOutput')
const Interface = require('../../Interface')


module.exports = new Interface({
  method: 'eth_compileSolidity',
  inputterValidatorNames: ['string'],
  inputter: function(sol) {
    return [sol]
  },
  outputter: function outputter(result) {
    return new SolidityOutput(result)
  }
})