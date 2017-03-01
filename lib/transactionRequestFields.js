module.exports = {
  from: require('./validators/account'),
  to: require('./validators/amorphAddress'),
  value: require('./validators/amorphNaturalNumber'),
  gas: require('./validators/amorphNaturalNumber'),
  gasPrice: require('./validators/amorphNaturalNumber'),
  data: require('./validators/amorph'),
  nonce: require('./validators/amorphNaturalNumber')
}
