const ultralightbeam = require('./ultralightbeam')
const Q = require('q')
const storageContractInfo = require('./storageContractInfo')
const accounts = require('./accounts')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')

const deferred = Q.defer()
module.exports = deferred.promise

describe('storageContract', () => {
  let storageContract

  after(() => {
    deferred.resolve(storageContract)
  })

  it('should deploy', () => {
    return ultralightbeam.solDeploy(
      storageContractInfo.code,
      storageContractInfo.abi,
      [],
      { value: Amorph.from(amorphNumber.unsigned, 1) }
    ).then((_storageContract) => {
      storageContract = _storageContract
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(storageContract.address).should.eventually.amorphEqual(
      storageContractInfo.runcode
    )
  })

  it('should have correct balance', () => {
    return ultralightbeam.eth.getBalance(storageContract.address).should.eventually.amorphTo(amorphNumber.unsigned).equal(1)
  })

  it('should have correct pos0', () => {
    return storageContract.fetch('pos0()', []).should.eventually.amorphTo(amorphNumber.unsigned).equal(1234)
  })

  it('should have correct pos1[msg.sender]', () => {
    return storageContract.fetch('pos1(address)', [accounts[0].address]).should.eventually.amorphTo(amorphNumber.unsigned).equal(5678)
  })
})
