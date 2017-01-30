const errors = require('./errors')

function TransactionMonitor(
  ultralightbeam,
  _transactionRequest,
  transactionHook,
  maxBlocksToWait
) {
  this.ultralightbeam = ultralightbeam
  this.transactionRequest = _transactionRequest
  this.isApproved = false

  const deferredTransactionHash = ultralightbeam.defer()
  const deferredTransaction = ultralightbeam.defer()

  this.transactionHashPromise = deferredTransactionHash.promise
  this.transactionPromise = deferredTransaction.promise

  transactionHook(_transactionRequest).then((transactionRequest) => {
    let rawTransactionRequest
    try {
      rawTransactionRequest = transactionRequest.toRawSigned()
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
        if (blocksWaited >= maxBlocksToWait) {
          ultralightbeam.blockPoller.emitter.removeListener('block', onBlock)
          const blocksWaitedError = new errors.BlocksWaitedError(blocksWaited)
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

TransactionMonitor.prototype.getTransactionHash = function getTransactionHash() {
  return this.transactionHashPromise
}

TransactionMonitor.prototype.getTransaction = function getTransaction() {
  return this.transactionPromise
}

TransactionMonitor.prototype.getTransactionReceipt = function getTransactionReceipt() {
  return this.getTransaction().then((transaction) => {
    return this.ultralightbeam.eth.getTransactionReceipt(transaction.hash)
  })
}

module.exports = TransactionMonitor
