const requireDirectory = require('require-directory')
const interfacesByProtocol = requireDirectory(module, '../lib/interfaces')
const Interface = require('../lib/Interface')
const _ = require('lodash')
const Validator = require('../lib/Validator')

describe('interfaces', () => {

  it('should have 4 protocols [eth, miner, net, web3]', () => {
    Object.keys(interfacesByProtocol).should.deep.equal(['eth', 'miner', 'net', 'web3'])
  })

  _.forEach(interfacesByProtocol, (interfaces, protocolName) => {
    _.forEach(interfaces, (interface, interfaceName) => {
      describe(`${protocolName}.${interfaceName}`, () => {

        it('should be instance of Interface', () => {
          interface.should.be.instanceof(Interface)
        })

        it('inputterValidators should be instance of array', () => {
          interface.inputterValidators.should.be.instanceof(Array)
        })

        it('inputterValidators should have same length as inputter arguments', () => {
          const argumentsLength = interface.inputter ? interface.inputter.length : 0
          interface.inputterValidators.length.should.equal(argumentsLength)
        })

        interface.inputterValidators.forEach((validator, index) => {
          it(`inputterValidator #${index} (${interface.inputterValidatorNames[index]}) should be instance of Validator`, () => {
            validator.should.be.instanceof(Validator)
          })
        })

      })
    })
  })

})