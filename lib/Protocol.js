const _ = require('lodash')
const BatchPart = require('./BatchPart')
const defunction = require('defunction')
const v = require('./validates')

const Protocol = module.exports = defunction([v.ultralightbeam, v.pojo], v.undefined, function Protocol(ultralightbeam, interfaces) {
  this.ultralightbeam = ultralightbeam
  _.forEach(interfaces, (_interface) => {
    this.addInterface(_interface)
  })
})

Protocol.prototype.addInterface = defunction([v.interface], v.undefined, function addInterface(_interface) {
  const ultralightbeam = this.ultralightbeam

  this[_interface.name] = function interfaceName(...inputs) {

    const batchPart = new BatchPart(ultralightbeam, _interface, inputs)

    ultralightbeam.batch.parts.push(batchPart)
    ultralightbeam.execute()

    return batchPart.deferred.promise

  }
  Object.defineProperty(this[_interface.name], 'name', {
    value: _interface.name
  })
})
