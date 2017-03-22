const ultralightbeam = require('./ultralightbeam')
const SolWrapper = require('../lib/SolWrapper')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const account = require('./account')
const amorphParseSolcOutput = require('amorph-parse-solc-output')
const _ = require('lodash')

const AliasReg = {
  sol: `pragma solidity ^0.4.4;
        contract AliasReg {

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
}

_.merge(AliasReg, amorphParseSolcOutput(solc.compile(AliasReg.sol, 1)).AliasReg)

describe('AliasReg', () => {

  const myAlias = new Amorph('myAlias', 'ascii')

  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      AliasReg.code, AliasReg.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getContractAddress().then((
      contractAddress
    ) => {
      AliasReg.address = contractAddress
      AliasReg.SolWrapper = new SolWrapper(
        ultralightbeam, AliasReg.abi, contractAddress
      )

    }).should.be.fulfilled
  })

  it('should have correct runcode', () => {
    ultralightbeam.eth.getCode(AliasReg.address).should.eventually.amorphEqual(
      AliasReg.runcode, 'hex'
    )
  })

  it('myAlias should be an address', () => {
    return AliasReg.SolWrapper.fetch(
        'getAddr(bytes32)',
        [myAlias]
      )
      .should.eventually.amorphTo('hex.prefixed').be.address()
  })

  it('myAlias should be zero', () => {
    return AliasReg.SolWrapper.fetch(
        'getAddr(bytes32)',
        [myAlias]
      )
      .should.eventually.amorphTo('number').equal(0)
  })

  it('myAlias claim myAlias', () => {
    return AliasReg.SolWrapper.broadcast(
        'claimAlias(bytes32)',
        [myAlias]
      ).transactionPromise.should.eventually.be.fulfilled
  })

  it('getAddr(myAlias) should return account0', () => {
    return AliasReg.SolWrapper.fetch(
        'getAddr(bytes32)',
        [myAlias]
      ).should.eventually.amorphEqual(account.address, 'hex')
  })

  it('getAlias(account0) should return myAlias', () => {
    return AliasReg.SolWrapper.fetch(
        'getAlias(address)',
        [account.address]
      ).should.eventually.amorphTo('hex.prefixed').be.ascii(myAlias.to('ascii'))
  })


})
