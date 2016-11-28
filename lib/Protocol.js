const _ = require('lodash')

function Protocol(solquester, interfaces) {
  _.forEach(interfaces, (interface, name) => {
    this[name] = function() {
      const params = interface.inputter ? interface.inputter.apply(solquester, arguments) : []
      solquester.batch.payload.push({
        method: interface.method,
        params: params
      })
      solquester.batch.outputters.push(interface.outputter || null)
      solquester.withHandler(null, null)
      solquester.execute()
      return solquester
    }
    Object.defineProperty(this[name], 'name', { value: name })
  })
}

module.exports = Protocol