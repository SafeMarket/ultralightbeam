const defunction = require('defunction')
const v = require('./validates')
const BlocksWaitedError = require('./errors/BlocksWaited')
const FailedTransactionError = require('./errors/FailedTransaction')
const ContractDeploymentError = require('./errors/ContractDeployment')
const amorphArray = require('amorph-array')
const NoFromError = require('./errors/NoFrom')
const BalanceTooLowError = require('./errors/BalanceTooLow')
const ExceedsBlockLimitError = require('./errors/ExceedsBlockLimit')
const Promise = require('bluebird')
const amorphHex = require('amorph-hex')
const amorphBignumber = require('amorph-bignumber')


const TransactionMonitor = module.exports = defunction(
  [v.ultralightbeam, v.transactionRequestish],
  v.undefined,
  function TransactionMonitor(ultralightbeam, transactionRequest) {

    this.ultralightbeam = ultralightbeam
    this.transactionRequest = transactionRequest

    const deferredTransactionHash = ultralightbeam.defer()
    const deferredTransaction = ultralightbeam.defer()

    this.transactionHashPromise = deferredTransactionHash.promise
    this.transactionPromise = deferredTransaction.promise

    this.prepare().then(() => {
      let rawTransactionRequest
      try {
        rawTransactionRequest = this.transactionRequest.toRawSigned()
      } catch(err) {
        deferredTransactionHash.reject(err)
        deferredTransaction.reject(err)
        return
      }
      return ultralightbeam.eth.sendRawTransaction(rawTransactionRequest).then((transactionHash) => {
        deferredTransactionHash.resolve(transactionHash)

        let blocksWaited = 0
        const onBlock = function onBlock(block) {
          block.transactions.forEach((transaction) => {
            if (!transaction.hash.equals(transactionHash)) {
              return
            }
            deferredTransaction.resolve(transaction)
            ultralightbeam.blockPoller.emitter.removeListener('block', onBlock)
          })
          blocksWaited ++
          if (blocksWaited >= ultralightbeam.options.maxBlocksToWait) {
            ultralightbeam.blockPoller.emitter.removeListener('block', onBlock)
            const blocksWaitedError = new BlocksWaitedError(`No result after waiting for ${blocksWaited} blocks`)
            deferredTransaction.reject(blocksWaitedError)
          }
        }
        ultralightbeam.blockPoller.emitter.on('block', onBlock)
      })
    }, (err) => {
      deferredTransactionHash.reject(err)
      deferredTransaction.reject(err)
    })

  }
)

TransactionMonitor.prototype.prepare = defunction([], v.promise, function prepare() {

  const ultralightbeam = this.ultralightbeam
  const transactionRequest = this.transactionRequest

  if (!transactionRequest.values.from) {
    throw new NoFromError('Set either transactionRequest.from or ultralightbeam.defaultAccount')
  }

  let gasPricePromise
  let gasPromise
  let gasLimitPromise

  if (transactionRequest.values.gasPrice) {
    gasPricePromise = ultralightbeam.resolve(transactionRequest.values.gasPrice)
  } else {
    if (ultralightbeam.blockPoller.gasPrice) {
      gasPricePromise = ultralightbeam.resolve(ultralightbeam.blockPoller.gasPrice)
    } else {
      gasPricePromise = ultralightbeam.blockPoller.gasPricePromise
    }
  }

  if (transactionRequest.values.gas) {
    gasPromise = ultralightbeam.resolve(transactionRequest.values.gas)
  } else {
    gasPromise = ultralightbeam.eth.estimateGas(transactionRequest).then((gas) => {
      return gas.as(amorphBignumber.unsigned, (bignumber) => {
        return bignumber.times(ultralightbeam.options.gasMultiplier).floor()
      })
    })
  }

  if (ultralightbeam.blockPoller.block) {
    gasLimitPromise = ultralightbeam.resolve(ultralightbeam.blockPoller.block.gasLimit)
  } else {
    gasLimitPromise = ultralightbeam.blockPoller.blockPromise.then((block) => {
      return block.gasLimit
    })
  }

  return Promise.all([
    gasPromise,
    gasPricePromise,
    gasLimitPromise,
    ultralightbeam.eth.getBalance(transactionRequest.values.from.address)
  ]).then((results) => {
    const gas = results[0]
    const gasPrice = results[1]
    const gasLimit = results[2]
    const balance = results[3]

    if (gas.to(amorphBignumber.unsigned).gt(gasLimit.to(amorphBignumber.unsigned))) {
      throw new ExceedsBlockLimitError(`Gas (${gas.to(amorphBignumber.unsigned)}) exceeds block gas limit (${gasLimit.to(amorphBignumber.unsigned)})`)
    }
    const gasCost = gas.as(amorphBignumber.unsigned, (bignumber) => {
      return bignumber.times(gasPrice.to(amorphBignumber.unsigned))
    })

    if (gasCost.to(amorphBignumber.unsigned).gt(balance.to(amorphBignumber.unsigned))) {
      throw new BalanceTooLowError(`This transaction costs ${gasCost.to(amorphBignumber.unsigned)} wei. Account ${transactionRequest.values.from.address.to(amorphHex.prefixed)} only has ${balance.to(amorphBignumber.unsigned)} wei.`)
    }

    transactionRequest.set('gas', gas)
    transactionRequest.set('gasPrice', gasPrice)

    let noncePromise

    if (transactionRequest.values.nonce) {
      noncePromise = ultralightbeam.resolve(transactionRequest.values.nonce)
    } else {
      noncePromise = ultralightbeam.getNonce(transactionRequest.values.from.address)
    }

    return noncePromise.then((nonce) => {
      transactionRequest.set('nonce', nonce)
      return ultralightbeam.options.approve(transactionRequest)
    })

  })
})

TransactionMonitor.prototype.getTransactionHash = defunction([], v.eventualAmorph, function getTransactionHash() {
  return this.transactionHashPromise
})

TransactionMonitor.prototype.getTransaction = defunction([], v.eventualTransaction, function getTransaction() {
  return this.transactionPromise
})

TransactionMonitor.prototype.getTransactionReceipt = defunction([], v.eventualTransactionReceipt, function getTransactionReceipt() {
  return this.getTransaction().then((transaction) => {
    return this.ultralightbeam.eth.getTransactionReceipt(transaction.hash)
  })
})

TransactionMonitor.prototype.getConfirmation = defunction([], v.promise, function getConfirmation() {
  return this.getTransactionReceipt().then((transactionReceipt) => {
    if (transactionReceipt.isFailed) {
      throw new FailedTransactionError('Transaction Failed')
    }
  })
})

TransactionMonitor.prototype.getContractAddress = defunction([], v.eventualAddress, function getContractAddress() {
  return this.getTransactionReceipt().then((transactionReceipt) => {
    const contractAddress = transactionReceipt.contractAddress
    return this.ultralightbeam.eth.getCode(contractAddress).then((code) => {
      if (code.to(amorphArray).length === 0) {
        throw new ContractDeploymentError('Contract did not deploy')
      }
      return contractAddress
    })
  })
})

module.exports = TransactionMonitor
