const parseSolcOutput = require('../lib/parseSolcOutput')
const solc = require('solc')
const storageContractSol = require('./storageContractSol')

module.exports = parseSolcOutput(solc.compile(storageContractSol, 1)).Storage
