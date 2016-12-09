const bulk = require('bulk-require')
const interfacesByProtocol = bulk(__dirname + '/../lib/interfaces/', [ '**/*.js' ])
const Interface = require('../lib/Interface')
const _ = require('lodash')
const Validator = require('../lib/Validator')

describe('interfaces', () => {

  it('should have 4 protocols [eth, miner, net, web3]', () => {
    interfacesByProtocol.should.have.all.keys(['eth', 'miner', 'net', 'web3'])
  })

  _.forEach(interfacesByProtocol, (interfaces, protocolName) => {
    _.forEach(interfaces, (_interface, interfaceName) => {
      describe(`${protocolName}.${interfaceName}`, () => {

        it('should be instance of Interface', () => {
          _interface.should.be.instanceof(Interface)
        })

        it('inputterValidators should be instance of array', () => {
          _interface.inputterValidators.should.be.instanceof(Array)
        })

        it('inputterValidators should have same length as inputter', () => {
          const argumentsLength = _interface.inputter ?
            _interface.inputter.length : 0
          _interface.inputterValidators.length.should.equal(argumentsLength)
        })

        _interface.inputterValidators.forEach((validator, index) => {
          it(`inputterValidator #${index} (${_interface.name}) should be instance of Validator`, () => {
            validator.should.be.instanceof(Validator)
          })
        })

      })
    })
  })

})
