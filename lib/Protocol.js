const _ = require('lodash')
const errors = require('./errors')
const BatchPart = require('./BatchPart')
const transactionRequestFields = require('./transactionRequestFields')
const TransactionRequest = require('./TransactionRequest')

function Protocol(ultralightbeam, interfaces) {
  this.ultralightbeam = ultralightbeam
  _.forEach(interfaces, (_interface) => {
    this.addInterface(_interface)
  })
}

Protocol.prototype.addInterface = function addInterface(_interface) {

  const ultralightbeam = this.ultralightbeam

  this[_interface.name] = function interfaceName(...inputs) {

    if (
      _interface.inputterValidators
      && _interface.inputterValidators.length !== inputs.length
    ) {
      throw new errors.ArgumentsLengthError(
        `${_interface.name} expects ${_interface.inputterValidators.length} arguments, received ${inputs.length}`
      )
    }

    _.toArray(inputs).forEach((input, index) => {
      _interface.inputterValidators[index].validate(
        `${_interface.name} input #${index}`,
        input
      )
    })

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
