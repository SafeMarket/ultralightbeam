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
        _interface.name,
        _interface.inputterValidators.length,
        inputs.length
      )
    }

    _.toArray(inputs).forEach((input, index) => {
      _interface.inputterValidators[index].validate(
        `${_interface.name} input #${index}`,
        input
      )
    })

    const batchPart = new BatchPart(ultralightbeam, _interface, inputs)

    _.forEach(transactionRequestFields, (validator, key) => {
      batchPart.deferred.promise[key] = (value) => {

        const transactionRequests = _.filter(batchPart.inputs, (input) => {
          return input instanceof TransactionRequest
        })

        if (transactionRequests.length === 0) {
          throw new errors.NoTransactionRequestError(key)
        }

        transactionRequests[0][key](value)
        return batchPart.deferred.promise

      }
      Object.defineProperty(batchPart.deferred.promise[key], 'name', {
        value: key
      })
    })

    ultralightbeam.batch.parts.push(batchPart)
    ultralightbeam.execute()

    return batchPart.deferred.promise

  }
  Object.defineProperty(this[_interface.name], 'name', {
    value: _interface.name
  })
}

module.exports = Protocol
