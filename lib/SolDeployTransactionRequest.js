const _ = require('lodash')
const TransactionRequest = require('./TransactionRequest')
const solidityCoder = require('web3/lib/solidity/coder')
const arguguard = require('arguguard')

function encodeConstructorParams(abi, params, Amorph) {
  const encodedParamsHex = abi.filter((json) => {
    return json.type === 'constructor' && json.inputs.length === params.length
  }).map((json) => {
    return json.inputs.map((input) => {
      return input.type
    })
  }).map((types) => {
    return solidityCoder.encodeParams(types, params.map((param) => {
      return param.to('hex.prefixed')
    }))
  })[0] || ''

  return new Amorph(encodedParamsHex, 'hex')
}

function SolDeployTransactionRequest(ultralightbeam, bytecode, abi, inputs, _transactionRequestOptions) {
  arguguard('SolDeployTransactionRequest', ['Ultralightbeam', 'Amorph', 'Array', 'Array', 'Object'], arguments)
  const encodedParams = encodeConstructorParams(abi, inputs, ultralightbeam.Amorph)
  const data = new ultralightbeam.Amorph(bytecode.to('array').concat(encodedParams.to('array')), 'array')
  const transactionRequestOptions = _.merge({ data }, _transactionRequestOptions)
  TransactionRequest.call(this, ultralightbeam, transactionRequestOptions)
}

SolDeployTransactionRequest.prototype = Object.create(TransactionRequest.prototype)
SolDeployTransactionRequest.prototype.constructr = SolDeployTransactionRequest

module.exports = SolDeployTransactionRequest
