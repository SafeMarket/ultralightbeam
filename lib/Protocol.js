const _ = require('lodash')
const Q = require('q')

function Protocol(solquester, interfaces) {
  this.solquester = solquester
  _.forEach(interfaces, (interface, name) => {
    this.addInterface(name, interface)
  })
}

Protocol.prototype.addInterface = function(name, interface) {
  const solquester = this.solquester
  this[name] = function() {

    const deferred = Q.defer()

    _.toArray(arguments).forEach((arg, index) => {
      const validator = interface.inputterValidators[index]
      if (validator && !validator.test.call(this, arg)) {
        throw new validator.Error(`${name} argument #${index}`, arg)
      }
    })

    solquester.batch.args.push(arguments)
    solquester.batch.interfaces.push(interface)
    solquester.batch.blockFlags.push(null)
    solquester.batch.executions.push(deferred)
    solquester.execute()
    return deferred.promise
  }
  Object.defineProperty(this[name], 'name', { value: name })
}

module.exports = Protocol