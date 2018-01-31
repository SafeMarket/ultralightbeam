const defunction = require('defunction')
const v = require('./validates')
const BlocksWaitedError = require('./errors/BlocksWaited')
const FailedTransactionError = require('./errors/FailedTransaction')
const ContractDeploymentError = require('./errors/ContractDeployment')
const amorphArray = require('amorph-array')

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

    ultralightbeam.options.transactionHook(this.transactionRequest).then((_transactionRequest) => {
      let rawTransactionRequest
      try {
        rawTransactionRequest = _transactionRequest.toRawSigned()
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
