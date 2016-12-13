const ultralightbeam = require('./ultralightbeam')
const Solbuilder = require('../lib/Solbuilder')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const blockFlags = require('../lib/blockFlags')
const TransactionReceipt = require('../lib/TransactionReceipt')

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
AliasReg.solbuilder = new Solbuilder(
  AliasReg.abi, AliasReg.bytecode
)

describe('AliasReg', () => {

  const myAlias = new Amorph('myAlias', 'ascii')

  it('should deploy', () => {
    return ultralightbeam.add(AliasReg.solbuilder.deploy()).then((
      transactionReceipt
    ) => {
      AliasReg.address = transactionReceipt.contractAddress
    }, (err) => {
      console.log(err)
      return err
    }).should.be.fulfilled
  })

  it('should have correct runtimeBytecode', () => {
    ultralightbeam.eth.getCode(
      AliasReg.address, blockFlags.latest
    ).should.eventually.amorphEqual(
      AliasReg.runtimeBytecode, 'hex'
    )
  })

  it('myAlias should be an address', () => {
    return ultralightbeam
      .add(AliasReg.solbuilder.get(
        AliasReg.address,
        'getAddr(bytes32)',
        [myAlias]
      ))
      .should.eventually.amorphTo('hex.prefixed').be.address()
  })

  it('myAlias should be zero', () => {
    return ultralightbeam
      .add(AliasReg.solbuilder.get(
        AliasReg.address,
        'getAddr(bytes32)',
        [myAlias]
      ))
      .should.eventually.amorphTo('number').equal(0)
  })

  it('myAlias claim myAlias', () => {
    return ultralightbeam
      .add(AliasReg.solbuilder.set(
        AliasReg.address,
        'claimAlias(bytes32)',
        [myAlias]
      ))
      .should.eventually.be.instanceOf(TransactionReceipt)
  })

  it('getAddr(myAlias) should return account0', () => {
    return ultralightbeam
      .add(AliasReg.solbuilder.get(
        AliasReg.address,
        'getAddr(bytes32)',
        [myAlias]
      )).should.eventually.amorphEqual(ultralightbeam.defaults.from.address, 'hex')
  })

  it('getAlias(account0) should return myAlias', () => {
    return ultralightbeam
      .add(AliasReg.solbuilder.get(
        AliasReg.address,
        'getAlias(address)',
        [ultralightbeam.defaults.from.address]
      ))
      .should.eventually.amorphTo('hex.prefixed').be.ascii(myAlias.to('ascii'))
  })


})
