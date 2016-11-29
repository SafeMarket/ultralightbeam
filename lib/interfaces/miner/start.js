const Amorph = require('../../../modules/Amorph')

module.exports = {
  method: 'miner_start',
  inputter: function (_threadCount) {
    const threadCount = _threadCount || 1
    return [new Amorph(threadCount, 'number').to('hex.prefixed')]
  }
}