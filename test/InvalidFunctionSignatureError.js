const storageContractPromise = require('./storageContract')
const InvalidFunctionSignatureError = require('../lib/errors/InvalidFunctionSignature')

describe('InvalidFunctionSignatureError', () => {
  let storageContract
  before(() => {
    return storageContractPromise.then((_storageContract) => {
      storageContract = _storageContract
    })
  })
  it('should throw when fetching invalid()', () => {
    (() => {
      storageContract.fetch('invalid()', [])
    }).should.throw(InvalidFunctionSignatureError)
  })
  it('should throw when broadcasting invalid()', () => {
    (() => {
      storageContract.broadcast('invalid()', [], {})
    }).should.throw(InvalidFunctionSignatureError)
  })
  it('should have correct message', () => {
    let error
    try {
      storageContract.fetch('invalid()', [])
    } catch(_error) {
      error = _error
    }
    error.message.should.equal('InvalidFunctionSignature: SolWrapper ABI has no function with signature "invalid()"')
  })
})
