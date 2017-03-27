const bulk = require('bulk-require')
const interfacesByProtocol = bulk(__dirname + '/../lib/interfaces/', [ '**/*.js' ])
const Interface = require('../lib/Interface')
const _ = require('lodash')

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

        it('inputDescriptions should be instance of array', () => {
          _interface.inputDescriptions.should.be.instanceof(Array)
        })

        it('inputDescriptions should have same length as inputter', () => {
          const argumentsLength = _interface.inputter ? _interface.inputter.length : 0
          _interface.inputDescriptions.should.have.length(argumentsLength)
        })

      })
    })
  })

})
