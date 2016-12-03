const solquester = require('./solquester')
const Solbuilder = require('../lib/Solbuilder')
const solc = require('solc')
const Amorph = require('../modules/Amorph')

const storageContract = {
  sol: `contract Storage {
        uint public pos0;
        mapping(address => uint) pos1;

        function Storage() {
            pos0 = 1234;
            pos1[msg.sender] = 5678;
        }
      }`
}

const solcOutput = solc.compile(storageContract.sol).contracts.Storage

storageContract.abi = JSON.parse(solcOutput.interface)
storageContract.bytecode = new Amorph(solcOutput.bytecode, 'hex')
storageContract.runtimeBytecode = new Amorph(solcOutput.runtimeBytecode, 'hex')
storageContract.solbuilder = new Solbuilder(storageContract.abi, storageContract.bytecode)

describe('storageContract', () => {
  it('should deploy', () => {
    return solquester
      .add(storageContract.solbuilder.deploy())
      .then((transactionHash) => {
        return solquester
          .pollForTransactionReceipt(transactionHash)
          .then((transactionReceipt) => {
            storageContract.address = transactionReceipt.contractAddress
          })
      }, (err) => {
        return Q.reject(err)
      }).should.be.fulfilled
  })
})

module.exports = storageContract