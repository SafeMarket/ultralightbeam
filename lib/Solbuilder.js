const Amorph = require('./Amorph')
const _ = require('lodash')
const TransactionRequest = require('./TransactionRequest')
const Manifest = require('./Manifest')
const SolidityFunction = require('web3/lib/web3/function')
const coder = require('web3/lib/solidity/coder')
const blockFlags = require('./blockFlags')

function encodeConstructorParams(abi, params) {
  const encodedParamsHex = abi.filter((json) => {
    return json.type === 'constructor' && json.inputs.length === params.length
  }).map((json) => {
    return json.inputs.map((input) => {
      return input.type
    })
  }).map((types) => {
    return coder.encodeParams(types, params.map((param) => {
      return param.to('hex.prefixed')
    }))
  })[0] || ''

  return new Amorph(encodedParamsHex, 'hex')
}

function Solbuilder(abi, bytecode) {
  _.merge(this, { abi, bytecode })

  this.solidityFunctions = {}

  abi.filter((json) => {
    return json.type === 'function'
  }).map((json) => {
    const solidityFunction = new SolidityFunction(null, json, null)
    this.solidityFunctions[solidityFunction._name] = solidityFunction
  })
}

Solbuilder.prototype.deploy = function deploy(_inputs) {
  const inputs = _inputs || []
  const encodedParams = encodeConstructorParams(this.abi, inputs)
  const data = new Amorph(
    this.bytecode.to('array').concat(encodedParams.to('array')),
    'array'
  )
  return new Manifest(
    'eth',
    'sendTransaction',
    [new TransactionRequest({ data })]
  )
}

// eslint-disable-next-line max-len
Solbuilder.prototype.get = function get(address, solidityFunctionName, _inputs) {
  const inputs = _inputs ? _inputs.map((input) => {
    return input.to('hex.prefixed')
  }) : []
  const solidityFunction = this.solidityFunctions[solidityFunctionName]
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  const data = new Amorph(dataHexPrefixed, 'hex.prefixed')

  return new Manifest(
    'eth',
    'call',
    [new TransactionRequest({ data, to: address }), blockFlags.latest],
    (bytes) => {
      const formatted = solidityFunction.unpackOutput(
        bytes.to('hex.prefixed')
      )

      if (_.isArray(formatted)) {
        return formatted.map((_formatted) => {
          return new Amorph(_formatted, 'hex.prefixed')
        })
      }

      return new Amorph(formatted, 'hex.prefixed')
    }
  )
}

// eslint-disable-next-line max-len
Solbuilder.prototype.set = function set(address, solidityFunctionName, _inputs) {
  const inputs = _inputs ? _inputs.map((input) => {
    return input.to('hex.prefixed')
  }) : []
  const solidityFunction = this.solidityFunctions[solidityFunctionName]
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  const data = new Amorph(dataHexPrefixed, 'hex.prefixed')

  return new Manifest(
    'eth',
    'sendTransaction',
    [new TransactionRequest({ data, to: address })]
  )
}

module.exports = Solbuilder
