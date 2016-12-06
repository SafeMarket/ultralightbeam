const Amorph = require('./Amorph')
const Buffer = require('buffer')
const _ = require('lodash')
const TransactionRequest = require('./TransactionRequest')
const Manifest = require('./Manifest')
const SolidityFunction = require('web3/lib/web3/function')
const coder = require('web3/lib/solidity/coder')
const blockFlags = require('./blockFlags')

function encodeConstructorParams (abi, params) {
  const encodedParamsHex = abi.filter(function (json) {
      return json.type === 'constructor' && json.inputs.length === params.length;
  }).map(function (json) {
      return json.inputs.map(function (input) {
          return input.type;
      });
  }).map(function (types) {
      return coder.encodeParams(types, params.map((param) => { return params.to('hex.prefixed') }));
  })[0] || '';

  return new Amorph(encodedParamsHex, 'hex')
}

function Solbuilder (abi, bytecode) {
  _.merge(this, { abi, bytecode })
  
  this.solidityFunctions = {}

  abi.filter((json) => {
    return json.type === 'function';
  }).map((json) => {
    const solidityFunction = new SolidityFunction(null, json, null)
    this.solidityFunctions[solidityFunction._name] = solidityFunction
  })
 }

Solbuilder.prototype.deploy = function deploy (_inputs) {
  const inputs = _inputs || []
  const encodedParams = encodeConstructorParams(this.abi, inputs)
  const data = new Amorph(
    this.bytecode.to('array').concat(encodedParams.to('array')),
    'array'
  )
  return new Manifest('eth', 'sendTransaction', [new TransactionRequest({ data })])
}

Solbuilder.prototype.get = function get (address, solidityFunctionName, _inputs) {
  const inputs = _inputs ? _inputs.map(() => { return _inputs.to('hex.prefixed') }) : []
  const solidityFunction = this.solidityFunctions[solidityFunctionName]
  const dataHexPrefixed = solidityFunction.getData.apply(
    solidityFunction,
    inputs
  )
  const data = new Amorph(dataHexPrefixed, 'hex.prefixed')
  return new Manifest('eth', 'call', [new TransactionRequest({ data, to: address }), blockFlags.latest])
}

module.exports = Solbuilder