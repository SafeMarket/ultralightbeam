const _ = require('lodash')
const Amorph = require('./Amorph')
const TransactionRequest = require('./TransactionRequest')
const amorphValidator = require('./validators/amorph')
const arrayValidator = require('./validators/array')
const pojoValidator = require('./validators/pojo')
const solidityCoder = require('web3/lib/solidity/coder')

function encodeConstructorParams(abi, params) {
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

function SolDeployTransactionRequest(bytecode, abi, inputs, _transactionRequestOptions) {

  amorphValidator.validate('SolDeployTransactionRequest argument #0', bytecode)
  arrayValidator.validate('SolDeployTransactionRequest argument #1', abi)
  arrayValidator.validate('SolDeployTransactionRequest argument #2', inputs)
  pojoValidator.validate(
    'SolDeployTransactionRequest argument #3',
    _transactionRequestOptions,
    true
  )

  const encodedParams = encodeConstructorParams(abi, inputs)
  const data = new Amorph(
    bytecode.to('array').concat(encodedParams.to('array')),
    'array'
  )
  const transactionRequestOptions = _.merge({ data }, _transactionRequestOptions)

  TransactionRequest.call(this, transactionRequestOptions)
}

SolDeployTransactionRequest.prototype = Object.create(TransactionRequest.prototype)
SolDeployTransactionRequest.prototype.constructr = SolDeployTransactionRequest

module.exports = SolDeployTransactionRequest
