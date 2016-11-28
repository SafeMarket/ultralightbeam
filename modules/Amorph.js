const Amorph = require('amorph')
Amorph.loadConverters(require('amorph-hex'))
Amorph.loadConverters(require('amorph-base58'))
Amorph.loadConverters(require('amorph-bignumber'))
Amorph.ready()

module.exports = Amorph