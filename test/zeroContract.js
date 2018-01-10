const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const amorphParseSolcOutput = require('./parseSolcOutput')
const Amorph = require('./Amorph')

const sol = `
  pragma solidity ^0.4.4;
  contract Contract {

    uint256 public a;

    function Contract(uint256 _a) public {
      a = _a;
    }

  }
`

const info = amorphParseSolcOutput(solc.compile(sol, 1)).Contract

describe('zeroContract', () => {

  let gas
  let contract

  it('should deploy', () => {
    return ultralightbeam.solDeploy(info.code, info.abi, [new Amorph(0, 'number')], {}).then((_contract) => {
      contract = _contract
    })
  })

})
