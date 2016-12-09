const Validator = require('../Validator')
const BlockFlag = require('../BlockFlag')

module.exports = new Validator('BlockFlag', 'instance of BlockFlag', (arg) => {
  return arg instanceof BlockFlag || arg === undefined
})
