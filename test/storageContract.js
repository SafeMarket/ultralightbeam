const ultralightbeam = require('./ultralightbeam')
const Amorph = require('../lib/Amorph')
const Q = require('q')
const storageContractInfo = require('./storageContractInfo')
const accounts = require('./accounts')

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
      { value: new Amorph(1, 'number') }
    ).then((_storageContract) => {
      storageContract = _storageContract
    }).should.be.fulfilled
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(storageContract.address).should.eventually.amorphEqual(
      storageContractInfo.runcode, 'hex'
    )
  })

  it('should have correct balance', () => {
    return ultralightbeam.eth.getBalance(storageContract.address).should.eventually.amorphTo('number').equal(1)
  })

  it('should have correct pos0', () => {
    return storageContract.fetch('pos0()', []).should.eventually.amorphTo('number').equal(1234)
  })

  it('should have correct pos1[msg.sender]', () => {
    return storageContract.fetch('pos1(address)', [accounts[0].address]).should.eventually.amorphTo('number').equal(5678)
  })
})
