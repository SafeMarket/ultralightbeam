const _ = require('lodash')

module.exports = function Interface(name, method, _options) {
  _.merge(this, { name, method })

  const options = _options || {}
  _.merge(this, options)
  this.inputterValidators = options.inputterValidators || []
}
