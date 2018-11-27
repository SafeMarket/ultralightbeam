const getValidateConstructorNamed = require('defunction/lib/validates/getConstructorNamed')
const getValidateTypeOf = require('defunction/lib/validates/getTypeOf')
const getValidateInstanceOf = require('defunction/lib/validates/getInstanceOf')
const getValidateArrayOf = require('defunction/lib/validates/getArrayOf')
const getValidateDeepArrayOf = require('defunction/lib/validates/getDeepArrayOf')
const getValidateEventual = require('defunction/lib/validates/getEventual')
const getValidateLengthOf = require('defunction/lib/validates/getLengthOf')
const getValidateAllOf = require('defunction/lib/validates/getAllOf')
const getValidateOneOf = require('defunction/lib/validates/getOneOf')
const getValidateOptional = require('defunction/lib/validates/getOptional')
const secp256k1 = require('secp256k1')

const v = module.exports

v.anything = require('defunction/lib/validates/anything')

v.optionalAnything = getValidateOptional(v.anything)
v.batch = getValidateConstructorNamed('Batch')
v.account = getValidateConstructorNamed('Account')
v.undefined = getValidateTypeOf('undefined')
v.ultralightbeam = getValidateConstructorNamed('Ultralightbeam')
v.interface = getValidateConstructorNamed('Interface')
v.string = getValidateTypeOf('string')
v.array = getValidateInstanceOf(Array)
v.function = getValidateInstanceOf(Function)
v.object = getValidateInstanceOf(Object)
v.amorph = getValidateConstructorNamed('Amorph')
v.pojo = getValidateConstructorNamed('Object')
v.boolean = getValidateTypeOf('boolean')
v.number = getValidateTypeOf('number')
v.prefixedHex = getValidateAllOf([v.string], (label, arg) => {
  if (arg.length < 2) {
    throw new Error(`${label} should have a length of at least 2`)
  }
  if (arg.indexOf('0x') !== 0) {
    throw new Error(`${label} should begin with 0x`)
  }
  const hexRegex = /[0-9A-Fa-f]{6}/g
  if (!hexRegex.test(arg.substr(2))) {
    throw new Error(`${label} should be valid hexidecimal`)
  }
  return arg
})
v.promise = (label, arg) => {
  v.function(`${label}.then`, arg.then)
  return arg
}
v.inputs = getValidateDeepArrayOf(v.amorph)
v.block = getValidateConstructorNamed('Block')
v.eventualBlock = getValidateEventual(v.block)
v.blockFlag = getValidateConstructorNamed('BlockFlag')
v.transaction = getValidateConstructorNamed('Transaction')
v.transactionMonitor = getValidateConstructorNamed('TransactionMonitor')
v.transactionRequest = getValidateConstructorNamed('TransactionRequest')
v.solDeployTransactionRequest = getValidateConstructorNamed('SolDeployTransactionRequest')
v.solWrapper = getValidateConstructorNamed('SolWrapper')
v.eventualSolWrapper = getValidateEventual(v.solWrapper)
v.transactionRequestish = getValidateOneOf([v.transactionRequest, v.solDeployTransactionRequest])
v.transactionReceipt = getValidateConstructorNamed('TransactionReceipt')
v.eventLogs = getValidateArrayOf(getValidateConstructorNamed('EventLog'))
v.eventualAmorph = getValidateEventual(v.amorph)
v.eventualTransaction = getValidateEventual(v.transaction)
v.eventualTransactionReceipt = getValidateEventual(v.transactionReceipt)
v.address = getValidateAllOf([v.amorph, (label, arg) => {
  getValidateLengthOf(20)(`${label}.uint8Array`, arg.uint8Array)
  return arg
}])
v.eventualAddress = getValidateEventual(v.address)
v.promiseStub = (label, arg) => {
  v.object(label, arg)
  v.function(`${label.resolve}`, arg.resolve)
  v.function(`${label.reject}`, arg.reject)
  return arg
}
v.solWrapper = getValidateConstructorNamed('SolWrapper')
v.transactionRequestFields = {
  from: v.account,
  to: v.address,
  value: v.amorph,
  gas: v.amorph,
  gasPrice: v.amorph,
  data: v.amorph,
  nonce: v.amorph
}
v.transactionRequestField = (label, arg) => {
  v.string(label, arg)
  if (!v.transactionRequestFields[arg]) {
    throw new Error(`${label} should be a transaction request field, not "${arg}"`)
  }
  return arg
}
v.eventualSolDeployTransactionRequest = getValidateEventual(v.solDeployTransactionRequest)
v.word = getValidateAllOf([v.amorph, (label, arg) => {
  getValidateLengthOf(32)(`${label}.uint8Array`, arg.uint8Array)
}])
v.privateKey = getValidateAllOf([v.word, (label, arg) => {
  if(!secp256k1.privateKeyVerify(new Buffer(arg.uint8Array))) {
    throw new Error(`${label} is an invalid private key`)
  }
  return arg
}])
v.intGte1 = (label, arg) => {
  v.number(label, arg)
  if ((arg % 1) !== 0) {
    throw new Error(`${label} should be an integer, received ${arg}`)
  }
  if (arg < 1) {
    throw new Error(`${label} should be greater than or equal to 1, received ${arg}`)
  }
  return arg
}
