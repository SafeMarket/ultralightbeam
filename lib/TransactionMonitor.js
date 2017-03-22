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
          const blocksWaitedError = new errors.BlocksWaitedError(`No result after waiting for ${blocksWaited} blocks`)
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

TransactionMonitor.prototype.getConfirmation = function getConfirmation() {
  return this.getTransactionReceipt().then((transactionReceipt) => {
    const gas = this.transactionRequest.values.gas
    if (
      this.ultralightbeam.options.deduceOOGErrors
      && gas
      && gas.equals(transactionReceipt.gasUsed)
    ) {
      throw new errors.OOGError(`Transaction used up all ${gas.to('number')} gas. This may be a false positive due to setting a gas multiplier of 1.`)
    }
  })
}

TransactionMonitor.prototype.getContractAddress = function getContractAddress() {
  return this.getTransactionReceipt().then((transactionReceipt) => {
    const contractAddress = transactionReceipt.contractAddress
    return this.ultralightbeam.eth.getCode(contractAddress).then((code) => {
      if (code.to('array').length === 0) {
        throw new errors.ContractDeploymentError('Contract did not deply')
      }
      return contractAddress
    })
  })
}

module.exports = TransactionMonitor
