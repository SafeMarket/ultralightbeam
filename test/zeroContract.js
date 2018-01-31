const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const parseSolcOutput = require('../lib/parseSolcOutput')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')

const sol = `
  pragma solidity ^0.4.4;
  contract Contract {

    uint256 public a;

    function Contract(uint256 _a) public {
      a = _a;
    }

  }
`

const info = parseSolcOutput(solc.compile(sol, 1)).Contract

describe('zeroContract', () => {

  let gas
  let contract

  it('should deploy', () => {
    return ultralightbeam.solDeploy(info.code, info.abi, [Amorph.from(amorphNumber.unsigned, 0)], {}).then((_contract) => {
      contract = _contract
    })
  })

})
