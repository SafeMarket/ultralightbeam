const ultralightbeam = require('./ultralightbeam')
const SolWrapper = require('../lib/SolWrapper')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const persona = require('../modules/persona')

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

const solcOutput = solc.compile(AliasReg.sol, 1).contracts.AliasReg

AliasReg.abi = JSON.parse(solcOutput.interface)
AliasReg.bytecode = new Amorph(solcOutput.bytecode, 'hex')
AliasReg.runtimeBytecode = new Amorph(solcOutput.runtimeBytecode, 'hex')

describe('AliasReg', () => {

  const myAlias = new Amorph('myAlias', 'ascii')

  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      AliasReg.bytecode, AliasReg.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      AliasReg.address = transactionReceipt.contractAddress
      AliasReg.SolWrapper = new SolWrapper(
        ultralightbeam, AliasReg.abi, AliasReg.address
      )

    }).should.be.fulfilled
  })

  it('should have correct runtimeBytecode', () => {
    ultralightbeam.eth.getCode(AliasReg.address).should.eventually.amorphEqual(
      AliasReg.runtimeBytecode, 'hex'
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
      ).should.eventually.amorphEqual(persona.address, 'hex')
  })

  it('getAlias(account0) should return myAlias', () => {
    return AliasReg.SolWrapper.fetch(
        'getAlias(address)',
        [persona.address]
      ).should.eventually.amorphTo('hex.prefixed').be.ascii(myAlias.to('ascii'))
  })


})
