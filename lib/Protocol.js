const _ = require('lodash')
const Q = require('q')
const errors = require('./errors')

function Protocol(ultralightbeam, interfaces) {
  this.ultralightbeam = ultralightbeam
  _.forEach(interfaces, (interface, name) => {
    this.addInterface(name, interface)
  })
}

Protocol.prototype.addInterface = function(name, interface) {
  const ultralightbeam = this.ultralightbeam
  this[name] = function() {

    if (interface.inputterValidators && interface.inputterValidators.length !== arguments.length) {
      throw new errors.ArgumentsLengthError(
        name,
        interface.inputterValidators.length,
        arguments.length
      )
    }

    _.toArray(arguments).forEach((arg, index) => {
      const validator = interface.inputterValidators[index]
      if (validator && !validator.test.call(this, arg)) {
        throw new validator.Error(`${name} argument #${index}`, arg)
      }
    })

    const deferred = Q.defer()

    ultralightbeam.batch.args.push(arguments)
    ultralightbeam.batch.interfaces.push(interface)
    ultralightbeam.batch.blockFlags.push(null)
    ultralightbeam.batch.executions.push(deferred)
    ultralightbeam.execute()
    return deferred.promise
  }
  Object.defineProperty(this[name], 'name', { value: name })
}

module.exports = Protocol