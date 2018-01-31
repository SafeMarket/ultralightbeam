const _ = require('lodash')
const TransactionRequest = require('./TransactionRequest')
const solidityCoder = require('web3/lib/solidity/coder')
const defunction = require('defunction')
const v = require('./validates')
const unamorphify = require('./unamorphify')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')
const amorphArray = require('amorph-array')

function encodeConstructorParams(abi, params) {
  const encodedParamsHex = abi.filter((json) => {
    return json.type === 'constructor' && json.inputs.length === params.length
  }).map((json) => {
    return json.inputs.map((input) => {
      return input.type
    })
  }).map((types) => {
    return solidityCoder.encodeParams(types, params.map((param, index) => {
      const type = types[index]
      return unamorphify(type, param)
    }))
  })[0] || ''

  return Amorph.from(amorphHex.unprefixed, encodedParamsHex)
}

const SolDeployTransactionRequest = module.exports = defunction(
  [v.ultralightbeam, v.amorph, v.array, v.array, v.pojo],
  v.undefined,
  function SolDeployTransactionRequest(ultralightbeam, bytecode, abi, inputs, _transactionRequestOptions) {
    const encodedParams = encodeConstructorParams(abi, inputs)
    const data = Amorph.from(amorphArray, bytecode.to(amorphArray).concat(encodedParams.to(amorphArray)))
    const transactionRequestOptions = _.merge({ data }, _transactionRequestOptions)
    TransactionRequest.call(this, ultralightbeam, transactionRequestOptions)
  }
)

SolDeployTransactionRequest.prototype = Object.create(TransactionRequest.prototype)
SolDeployTransactionRequest.prototype.constructor = SolDeployTransactionRequest
