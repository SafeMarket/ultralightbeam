const Ultralightbeam = require('../')
const TestRPC = require('ethereumjs-testrpc')
const accounts = require('./accounts')
const account = require('./account')
const Q = require('q')
const Amorph = require('../lib/Amorph')

const gasLimit = 4000000

const provider = TestRPC.provider({
  gasLimit: gasLimit,
  blocktime: 2,
  accounts: accounts.map((_account) => {
    return {
      balance: _account.balance.to('number'),
      secretKey: _account.privateKey.to('hex.prefixed')
    }
  })
})
const ultralightbeam = new Ultralightbeam(provider, {
  transactionHook: (transactionRequest) => {

    transactionRequest.set('from', account)

    if (ultralightbeam.gasPrice) {
      transactionRequest.set('gasPrice', ultralightbeam.gasPrice)
    }

    const promises = []

    if (!transactionRequest.values.gas) {
      const gasPromise = ultralightbeam.eth.estimateGas(transactionRequest).then((gas) => {
        if(gas.to('bignumber').gt(gasLimit)) {
          transactionRequest.set('gas', new Amorph(gasLimit, 'number'))
        } else {
          transactionRequest.set('gas', gas)
        }
      })

      promises.push(gasPromise)
    }

    if (transactionRequest.values.from && !transactionRequest.values.nonce) {
      const noncePromise =  ultralightbeam.eth.getTransactionCount(
        transactionRequest.values.from.address
      ).then((
        transactionCount
      ) => {
        transactionRequest.set('nonce', transactionCount)
      })
      promises.push(noncePromise)
    }

    return Q.all(promises).then(() => {
      return transactionRequest
    })
  }
})

module.exports = ultralightbeam
