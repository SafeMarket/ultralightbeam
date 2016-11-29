const _ = require('lodash')
const Q = require('q')

function Protocol(solquester, interfaces) {
  _.forEach(interfaces, (interface, name) => {
    this[name] = function() {
      const deferred = Q.defer()
      solquester.batch.args.push(arguments)
      solquester.batch.interfaces.push(interface)
      solquester.batch.blockFlags.push(null)
      solquester.batch.executions.push(deferred)
      solquester.execute()
      return deferred.promise
    }
    Object.defineProperty(this[name], 'name', { value: name })
  })
}

module.exports = Protocol