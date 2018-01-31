const amorphBignumber = require('amorph-bignumber')
const amorphAscii = require('amorph-ascii')
const amorphHex = require('amorph-hex')
const amorphBoolean = require('amorph-boolean')

module.exports = {
  uint: amorphBignumber.unsigned,
  int: amorphBignumber.signed,
  string: amorphAscii,
  bytes: amorphHex.prefixed,
  bool: amorphBoolean,
  address: amorphHex.prefixed
}
