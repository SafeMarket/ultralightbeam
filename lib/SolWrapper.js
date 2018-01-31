const SolidityFunction = require('web3/lib/web3/function')
const SolidityCoder = require('web3/lib/solidity/coder')
const sha3 = require('web3/lib/utils/sha3')
const _ = require('lodash')
const TransactionRequest = require('./TransactionRequest')
const TransactionReceiptParseError = require('./errors/TransactionReceiptParse')
const defunction = require('defunction')
const v = require('./validates')
const InvalidFunctionSignatureError = require('./errors/InvalidFunctionSignature')
const amorphify = require('./amorphify')
const unamorphify = require('./unamorphify')
const Amorph = require('amorph')
const amorphHex = require('amorph-hex')

const SolWrapper = module.exports = defunction(
  [v.ultralightbeam, v.array, v.amorph],
  v.undefined,
  function SolWrapper(ultralightbeam, abi, address) {
    _.merge(this, { ultralightbeam, abi, address })
    this.solidityFunctions = {}
    this.outputNames = {}

    abi.filter((pojo) => {
      return pojo.type === 'function'
    }).map((pojo) => {
      const solidityFunction = new SolidityFunction(null, pojo, null)
      const functionSignature = solidityFunction._name
      this.solidityFunctions[functionSignature] = solidityFunction
      const outputNames = pojo.outputs.map((output) => {
        return output.name
      })
      if (outputNames.indexOf('') === -1) {
        this.outputNames[functionSignature] = outputNames
      }
    })
  }
)

SolWrapper.prototype.getCalldata = defunction([v.string, v.inputs], v.amorph, function getCalldata(functionSignature, _inputs) {
  const solidityFunction = this.solidityFunctions[functionSignature]
  if (!solidityFunction) {
    throw new InvalidFunctionSignatureError(`SolWrapper ABI has no function with signature "${functionSignature}"`)
  }
  const inputs = _inputs.map((input, index) => {
    const type = solidityFunction._inputTypes[index]
    return unamorphify(type, input)
  })
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  return Amorph.from(amorphHex.prefixed, dataHexPrefixed)
})

SolWrapper.prototype.getTransactionRequest = defunction(
  [v.string, v.inputs, v.pojo],
  v.transactionRequest,
  function getTransactionRequest(functionSignature, inputs, options) {
    const data = this.getCalldata(functionSignature, inputs)
    return new TransactionRequest(this.ultralightbeam, _.merge({ data, to: this.address }, options))
  }
)

SolWrapper.prototype.broadcast = defunction(
  [v.string, v.inputs, v.pojo],
  v.transactionMonitor,
  function broadcast(functionSignature, inputs, options) {
    return this.getTransactionRequest(functionSignature, inputs, options).send()
  }
)

SolWrapper.prototype.fetch = defunction(
  [v.string, v.inputs],
  v.promise,
  function fetch(functionSignature, inputs) {

    const transactionRequest = this.getTransactionRequest(functionSignature, inputs, {})
    const solidityFunction = this.solidityFunctions[functionSignature]

    return this.ultralightbeam.eth.call(transactionRequest).then((bytes) => {
      let bytesHexPrefixed = bytes.to(amorphHex.prefixed)
      if (bytesHexPrefixed.length === 2) {
        bytesHexPrefixed += '00'
      }
      const output = solidityFunction.unpackOutput(bytesHexPrefixed)

      if (solidityFunction._outputTypes.length === 1) {
        // Single return value
        const type = solidityFunction._outputTypes[0]
        return amorphify(type, output, this.Amorph)
      }

      // Multiple return values
      const outputs = output.map((_output, index) => {
        const type = solidityFunction._outputTypes[index]
        return amorphify(type, _output, this.Amorph)
      })

      const outputNames = this.outputNames[functionSignature]
      if (outputNames) {
        const namedOutputs = {}
        outputs.forEach((_output, index) => {
          namedOutputs[outputNames[index]] = _output
        })
        return namedOutputs
      }

      return outputs
    })
  }
)

const EventLog = defunction([v.ultralightbeam, v.pojo, v.array], v.undefined, function EventLog(ultralightbeam, log, abi) {

  let item = null

  _.forEach(abi, (_item) => {
    if (_item.type !== 'event') {
      return
    }
    const types = _item.inputs.map((input) => {
      return input.type
    })
    const signature = `${_item.name}(${types.join(',')})`
    const hash = `0x${sha3(signature)}`
    if (hash === log.topics[0]) {
      this.signature = signature
      item = _item
      return false
    }
  })

  if (item === null) {
    throw new TransactionReceiptParseError('Could not parse transaction receipt')
  }

  const types = item.inputs.map((input) => { return input.type })

  this.values = SolidityCoder.decodeParams(types, log.data.replace('0x', '')).map((value, index) => {
    return amorphify(types[index], value, Amorph)
  })

  this.topics = {}

  item.inputs.map((input) => {
    return input.name
  }).forEach((name, index) => {
    if (!name) {
      return
    }
    this.topics[name] = this.values[index]
  })

})

SolWrapper.prototype.parseTransactionReceipt = defunction(
  [v.transactionReceipt],
  v.eventLogs,
  function parseTransactionReceipt(transactionReceipt) {
    return transactionReceipt.raw.logs.map((log) => {
      return new EventLog(this.ultralightbeam, log, this.abi)
    })
  }
)

module.exports = SolWrapper
