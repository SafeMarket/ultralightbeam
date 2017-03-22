const amorphParseSolcOutput = require('amorph-parse-solc-output')
const solc = require('solc')
const storageContractSol = require('./storageContractSol')

module.exports = amorphParseSolcOutput(solc.compile(storageContractSol, 1)).Storage
