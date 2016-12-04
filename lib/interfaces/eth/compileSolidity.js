const SolidityOutput = require('../../SolidityOutput')

module.exports = {
  method: 'eth_compileSolidity',
  inputter: function(sol) {
    return [sol]
  },
  outputter: function outputter(result) {
    return new SolidityOutput(result)
  }
}