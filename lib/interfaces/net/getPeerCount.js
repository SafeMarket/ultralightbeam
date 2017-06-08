const Interface = require('../../Interface')

module.exports = new Interface('getPeerCount', 'net_peerCount', [], {
  outputter: function outputter(result) {
    return result
  }
})
