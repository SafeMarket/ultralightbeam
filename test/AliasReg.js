const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const parseSolcOutput = require('../lib/parseSolcOutput')
const Amorph = require('amorph')

const aliasRegSol = `
  pragma solidity ^0.4.4;
  contract aliasReg {

    mapping(address=>bytes32) addrToAliasMap;
    mapping(bytes32=>address) aliasToAddrMap;

    function claimAlias(bytes32 alias) {
      if(aliasToAddrMap[alias] != address(0))
        throw;

      if(alias == '')
        throw;

      addrToAliasMap[msg.sender]=alias;
      aliasToAddrMap[alias]=msg.sender;
    }

    function getAddr(bytes32 alias) constant returns(address) {
      return aliasToAddrMap[alias];
    }

    function getAlias(address addr) constant returns(bytes32) {
      return addrToAliasMap[addr];
    }
  }`

const aliasRegInfo = parseSolcOutput(solc.compile(aliasRegSol, 1)).aliasReg

describe('aliasReg', () => {

  it('should deploy', () => {
    return ultralightbeam.solDeploy(aliasRegInfo.code, aliasRegInfo.abi, [], {})
  })

})
