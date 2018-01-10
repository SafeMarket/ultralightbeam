// require('time-require')
require('./chai')

process.on('uncaughtException', (error) => {
  console.log(error)
  //throw error
})

require('./zeroContract')
