const defunction = require('defunction')
const v = require('./validates')
const Amorph = require('amorph')
const SolcCompilationError = require('./errors/SolcCompilation')
const amorphHex = require('amorph-hex')
const soliditySha3 = require('solidity-sha3')

module.exports = defunction([v.pojo], v.pojo, function parseSolcOutput(output) {
  if (output.errors) {
    throw new SolcCompilationError(output.errors[0])
  }
  const contracts = {}
  Object.keys(output.contracts).forEach((contractName) => {
    _contract = output.contracts[contractName]
    contracts[contractName] = {
      name: contractName,
      code: Amorph.from(amorphHex.unprefixed, _contract.bytecode),
      codeHash: Amorph.from(amorphHex.prefixed, soliditySha3.default(`0x${_contract.bytecode}`)),
      runcode: Amorph.from(amorphHex.unprefixed, _contract.runtimeBytecode),
      abi: JSON.parse(_contract.interface)
    }
  })
  return contracts
})
