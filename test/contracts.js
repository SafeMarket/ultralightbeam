const glob = require('glob')
const fs = require('fs')
const solc = require('solc')
const _ = require('lodash')
const Amorph = require('../lib/Amorph')

const contracts = {}

describe('contracts', () => {

  const sources = {}

  it('should get globbed', () => {
    glob.sync('contracts/**/*.sol').forEach((filePath) => {
      const fileName = _.last(filePath.split('/'))
      sources[fileName] = fs.readFileSync(filePath, 'utf-8')
    })

  })

  it('should get solc', () => {
    const solcOutput = solc.compile({ sources })
    if (solcOutput.errors && solcOutput.errors.length > 0) {
      throw new Error(solcOutput.errors[0])
    }
    _.forEach(solcOutput.contracts, (_contract, name) => {
      contracts[name] = {
        abi: JSON.parse(_contract.interface),
        bytecode: new Amorph(_contract.bytecode, 'hex'),
        runtimeBytecode: new Amorph(_contract.runtimeBytecode, 'hex')
      }
    })
  })

})

module.exports = contracts
