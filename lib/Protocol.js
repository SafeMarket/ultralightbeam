const _ = require('lodash')
const Q = require('q')

function Protocol(ultralightbeam, interfaces) {
  this.ultralightbeam = ultralightbeam
  _.forEach(interfaces, (interface, name) => {
    this.addInterface(name, interface)
  })
}

Protocol.prototype.addInterface = function(name, interface) {
  const ultralightbeam = this.ultralightbeam
  this[name] = function() {

    const deferred = Q.defer()

    _.toArray(arguments).forEach((arg, index) => {
      const validator = interface.inputterValidators[index]
      if (validator && !validator.test.call(this, arg)) {
        throw new validator.Error(`${name} argument #${index}`, arg)
      }
    })

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