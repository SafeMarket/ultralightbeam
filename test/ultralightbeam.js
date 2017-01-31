const Ultralightbeam = require('../')
const TestRPC = require('ethereumjs-testrpc')
const personas = require('../modules/personas')
const persona = require('../modules/persona')
const Q = require('q')

const gasLimit = 4000000

const provider = TestRPC.provider({
  gasLimit: gasLimit,
  blocktime: 2,
  accounts: personas.map((_persona) => {
    return {
      balance: _persona.balance.to('number'),
      secretKey: _persona.privateKey.to('hex.prefixed')
    }
  })
})
const ultralightbeam = new Ultralightbeam(provider, {
  transactionHook: (transactionRequest) => {

    transactionRequest.set('from', persona)

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
