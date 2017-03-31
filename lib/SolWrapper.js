const SolidityFunction = require('web3/lib/web3/function')
const SolidityCoder = require('web3/lib/solidity/coder')
const sha3 = require('web3/lib/utils/sha3')
const _ = require('lodash')
const stripType = require('./stripType')
const Amorph = require('./Amorph')
const TransactionRequest = require('./TransactionRequest')
const TransactionReceiptParseError = require('./errors/TransactionReceiptParse')
const arguguard = require('arguguard')
const inputsValidator = require('./validators/inputs')
const InvalidFunctionSignatureError = require('./errors/InvalidFunctionSignature')

function SolWrapper(ultralightbeam, abi, address) {
  arguguard('SolWrapper', [Object, Array, Amorph], arguments)

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

function unamorphify(type, input) {
  if(_.isArray(input)) {
    return input.map((_input) => {
      return unamorphify(type, _input)
    })
  }
  const strippedType = stripType(type)
  const form = `web3.${strippedType}`
  return input.to(form)
}

function reamorphify(type, output) {
  const strippedType = stripType(type)
  if (!_.isArray(output)) {
    const form = `web3.${strippedType}`
    return new Amorph(output, form)
  }
  return output.map((_output) => {
    return reamorphify(type, _output)
  })
}

SolWrapper.prototype.getCalldata = function getCalldata(functionSignature, _inputs) {
  arguguard('solWrapper.getCalldata', ['string', inputsValidator], arguments)
  const solidityFunction = this.solidityFunctions[functionSignature]
  if (!solidityFunction) {
    throw new InvalidFunctionSignatureError(`SolWrapper ABI has no function with signature "${functionSignature}"`)
  }
  const inputs = _inputs.map((input, index) => {
    const type = solidityFunction._inputTypes[index]
    return unamorphify(type, input)
  })
  const dataHexPrefixed = solidityFunction.getData(...inputs)
  return new Amorph(dataHexPrefixed, 'hex.prefixed')
}

SolWrapper.prototype.getTransactionRequest = function getTransactionRequest(
  functionSignature, inputs, options
) {
  arguguard('solWrapper.getTransactionRequest', ['string', inputsValidator, Object], arguments)
  const data = this.getCalldata(functionSignature, inputs)
  return new TransactionRequest(this.ultralightbeam, _.merge({ data, to: this.address }, options))
}

SolWrapper.prototype.broadcast = function broadcast(functionSignature, inputs, options) {
  arguguard('solWrapper.broadcast', ['string', inputsValidator, Object], arguments)
  return this.getTransactionRequest(functionSignature, inputs, options).send()
}

SolWrapper.prototype.fetch = function fetch(functionSignature, inputs) {
  arguguard('solWrapper.fetch', ['string', inputsValidator], arguments)

  const transactionRequest = this.getTransactionRequest(functionSignature, inputs, {})
  const solidityFunction = this.solidityFunctions[functionSignature]

  return this.ultralightbeam.eth.call(transactionRequest).then((bytes) => {
    let bytesHexPrefixed = bytes.to('hex.prefixed')
    if (bytesHexPrefixed.length === 2) {
      bytesHexPrefixed += '00'
    }
    const output = solidityFunction.unpackOutput(bytesHexPrefixed)

    if (solidityFunction._outputTypes.length === 1) {
      // Single return value
      const type = solidityFunction._outputTypes[0]
      return reamorphify(type, output)
    }

    // Multiple return values
    const outputs = output.map((_output, index) => {
      const type = solidityFunction._outputTypes[index]
      return reamorphify(type, _output)
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

function EventLog(log, abi) {
  arguguard('EventLog', [Object, Array], arguments)

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
    return reamorphify(types[index], value)
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

}

SolWrapper.prototype.parseTransactionReceipt = function parseTransactionReceipt(transactionReceipt) {
  arguguard('solWrapper.parseTransactionReceipt', [Object], arguments)
  return transactionReceipt.raw.logs.map((log) => {
    return new EventLog(log, this.abi)
  })
}

module.exports = SolWrapper
