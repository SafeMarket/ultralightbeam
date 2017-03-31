const _ = require('lodash')
const BatchPart = require('./BatchPart')
const Interface = require('./Interface')
const arguguard = require('arguguard')

function Protocol(ultralightbeam, interfaces) {
  arguguard('Protocol', [Object, Object], arguments)
  this.ultralightbeam = ultralightbeam
  _.forEach(interfaces, (_interface) => {
    this.addInterface(_interface)
  })
}

Protocol.prototype.addInterface = function addInterface(_interface) {
  arguguard('protocol.addInterface', [Interface], arguments)

  const ultralightbeam = this.ultralightbeam

  this[_interface.name] = function interfaceName(...inputs) {
    arguguard(_interface.name, _interface.inputDescriptions, inputs)

    const batchPart = new BatchPart(ultralightbeam, _interface, inputs)

    ultralightbeam.batch.parts.push(batchPart)
    ultralightbeam.execute()

    return batchPart.deferred.promise

  }
  Object.defineProperty(this[_interface.name], 'name', {
    value: _interface.name
  })
}

module.exports = Protocol
