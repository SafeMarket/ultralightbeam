const _ = require('lodash')

module.exports = function Interface(pojo) {
  _.merge(this, pojo)
  this.validators = pojo.validators || []
}