const Q = require('q')
const coder = require('web3/lib/solidity/coder')
const Amorph = require('./modules/Amorph')
const _ = require('lodash')

const interfaces = [
  {
    name: 'getAccounts',
    method: 'eth_accounts',
    outputter: function outputter(result) {
      return result.map((account) => {
        return new Amorph(account, 'hex.prefixed')
      })
    }
  },
  {
    name: 'getBalance',
    method: 'eth_getBalance',
    inputter: function(account) {
      return [account.to('hex.prefixed'), 'latest']
    },
    outputter: function outputter(result) {
      return new Amorph(result, 'hex.prefixed')
    }
  },
  {
    name: 'deploy',
    method: 'eth_sendTransaction',
    inputter: function(abi, bytecode, inputs) {
      const encodedParams = encodeConstructorParams(abi, inputs)
      return [{
        data: '0x' + bytecode.to('hex') + encodedParams.to('hex'),
        from: this.account.to('hex.prefixed'),
        gas: 3300000
      }]
    },
    outputter: function outputter(result) {
      return new Amorph(result, 'hex.prefixed')
    }
  },
  {
    name: 'getTransactionReceipt',
    method: 'eth_getTransactionReceipt',
    inputter: function(transactionHash) {
      return [transactionHash.to('hex.prefixed')]
    },
    outputter: function outputter(result) {
      if (result === null) {
        return null;
      }
      return new TransactionReceipt(result)
    }
  },
  {
    name: 'getCode',
    method: 'eth_getCode',
    inputter: function(address) {
      return [address.to('hex.prefixed'), 'latest']
    },
    outputter: function outputter(result) {
      return new Amorph(result, 'hex.prefixed')
    }
  }
]

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
};

function Batch() {
  this.execution = Q.defer()
  this.payload = []
  this.outputters = []
  this.handlers = []
}

function TransactionReceipt(result) {

  _.merge(this, result)

  const prefixedHexKeys = [
    'transactionHash',
    'transactionIndex',
    'blockHash',
    'blockNumber',
    'gasUsed',
    'cumulativeGasUsed',
    'contractAddress'
  ]
  prefixedHexKeys.forEach((key) => {
    this[key] = new Amorph(result[key], 'hex.prefixed')
  })
}

function Solquester(provider) {
  const solquester = this
  this.provider = provider
  this.batch = new Batch()
  this.batches = []
}

Solquester.Batch = Batch
Solquester.TransactionReceipt = TransactionReceipt

interfaces.forEach((interface) => {
  Solquester.prototype[interface.name] = function() {
    const params = interface.inputter ? interface.inputter.apply(this, arguments) : []
    this.batch.payload.push({
      method: interface.method,
      params: params
    })
    this.batch.outputters.push(interface.outputter)
    this.withHandler(null, null)
    this.execute()
    return this
  }
})

Solquester.prototype.add = function add(options) {
  const _options = Array.isArray(options) ? options : [options]
  _options.forEach((option, index) => {
    this[option.name].apply(this, option.args)
    this.then(option.onSuccess, option.onError)
  })
  this.execute()
  return this
}

Solquester.prototype.withHandler = function (_onSuccess, _onError) {

  
  this.promise = Q.Promise((resolve, reject, notify) => {

    const onSuccess = (output) => {
      if (_onSuccess) {
        _onSuccess(output)
      }
      resolve(output)
      return output
    }

    const onError = (err) => {
      if (_onError) {
        _onError(output)
      }
      reject(err)
      return err
    }

    this.batch.handlers[this.batch.payload.length - 1] = { onSuccess, onError }

  });

  return this

}


const execute = _.debounce((solquester) => {

  const batch = solquester.batch

  solquester.batch = new Batch
  solquester.batches.push(batch)

  solquester.provider.sendAsync(batch.payload, (err, results) => {

    if (err) {
      batch.execution.reject(err)
      return
    }

    batch.outputs = results.map((result, index) => {
      if (batch.outputters[index]) {
        return batch.outputters[index](result.result)
      }
      return result
    })
    _.forEach(batch.handlers, (handler, index) => {
      handler.onSuccess(batch.outputs[index])
    })

    batch.execution.resolve(batch.outputs)

  })
}, 100)

Solquester.prototype.execute = function () {
  execute(this)
}

module.exports = Solquester