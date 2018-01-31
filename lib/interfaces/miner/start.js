const Interface = require('../../Interface')
const defunction = require('defunction')
const v = require('../../validates')

module.exports = new Interface('start', 'miner_start', {
  inputter: defunction([v.intGte1], v.array, function inputter(threadCount) {
    return [threadCount]
  })
})
