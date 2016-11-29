const BlockFlag = require('./BlockFlag')
const Amorph = require('./BlockFlag')

module.exports = {
  latest: new BlockFlag(() => {
    return 'latest'
  }),
  pending: new BlockFlag(() => {
    return 'pending'
  }),
  earliest: new BlockFlag(() => {
    return 'earliest'
  }),
  blockNumber: (blockNumber) => {
    return new BlockFlag(() => {
      return blockNumber.to('hex.prefixed')
    })
  }
}