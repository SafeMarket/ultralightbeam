const defunction = require('defunction')
const v = require('./validates')
const secureRandom = require('secure-random')
const Amorph = require('amorph')

module.exports = defunction([v.number], v.amorph, function getRandomAmorph(length) {
  return new Amorph(new Uint8Array(secureRandom(length)))
})
