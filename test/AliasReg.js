const ultralightbeam = require('./ultralightbeam')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const account = require('./account')
const amorphParseSolcOutput = require('amorph-parse-solc-output')

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

const aliasRegInfo = amorphParseSolcOutput(solc.compile(aliasRegSol, 1)).aliasReg

describe('aliasReg', () => {

  const myAlias = new Amorph('myAlias', 'ascii')
  let aliasReg

  it('should deploy', () => {
    return ultralightbeam.solDeploy(aliasRegInfo.code, aliasRegInfo.abi, []).then((_aliasReg) => {
      aliasReg = _aliasReg
    })
  })

  it('should have correct runcode', () => {
    ultralightbeam.eth.getCode(aliasReg.address).should.eventually.amorphEqual(
      aliasRegInfo.runcode, 'hex'
    )
  })

  it('myAlias should be an address', () => {
    return aliasReg.fetch(
      'getAddr(bytes32)',
      [myAlias]
    ).should.eventually.amorphTo('hex.prefixed').be.address()
  })

  it('myAlias should be zero', () => {
    return aliasReg.fetch(
      'getAddr(bytes32)',
      [myAlias]
    )
    .should.eventually.amorphTo('number').equal(0)
  })

  it('myAlias claim myAlias', () => {
    return aliasReg.broadcast(
      'claimAlias(bytes32)',
      [myAlias]
    ).transactionPromise.should.eventually.be.fulfilled
  })

  it('getAddr(myAlias) should return account0', () => {
    return aliasReg.fetch(
      'getAddr(bytes32)',
      [myAlias]
    ).should.eventually.amorphEqual(account.address, 'hex')
  })

  it('getAlias(account0) should return myAlias', () => {
    return aliasReg.fetch(
      'getAlias(address)',
      [account.address]
    ).should.eventually.amorphTo('hex.prefixed').be.ascii(myAlias.to('ascii'))
  })


})
