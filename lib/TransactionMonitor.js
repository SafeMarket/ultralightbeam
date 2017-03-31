const arguguard = require('arguguard')
const BlocksWaitedError = require('./errors/BlocksWaited')
const OOGError = require('./errors/OOG')
const ContractDeploymentError = require('./errors/ContractDeployment')

function TransactionMonitor(ultralightbeam, _transactionRequest) {
  arguguard('TransactionMonitor', [Object, Object], arguments)

  this.ultralightbeam = ultralightbeam
  this.transactionRequest = _transactionRequest

  const deferredTransactionHash = ultralightbeam.defer()
  const deferredTransaction = ultralightbeam.defer()

  this.transactionHashPromise = deferredTransactionHash.promise
  this.transactionPromise = deferredTransaction.promise

  ultralightbeam.options.transactionHook(_transactionRequest).then((transactionRequest) => {
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

TransactionMonitor.prototype.getTransactionHash = function getTransactionHash() {
  arguguard('transactionMonitor.getTransactionHash', [], arguments)
  return this.transactionHashPromise
}

TransactionMonitor.prototype.getTransaction = function getTransaction() {
  arguguard('transactionMonitor.getTransaction', [], arguments)
  return this.transactionPromise
}

TransactionMonitor.prototype.getTransactionReceipt = function getTransactionReceipt() {
  arguguard('transactionMonitor.getTransactionReceipt', [], arguments)
  return this.getTransaction().then((transaction) => {
    return this.ultralightbeam.eth.getTransactionReceipt(transaction.hash)
  })
}

TransactionMonitor.prototype.getConfirmation = function getConfirmation() {
  arguguard('transactionMonitor.getConfirmation', [], arguments)
  return this.getTransactionReceipt().then((transactionReceipt) => {
    const gas = this.transactionRequest.values.gas
    if (
      this.ultralightbeam.options.deduceOOGErrors
      && gas
      && gas.equals(transactionReceipt.gasUsed)
    ) {
      throw new OOGError(`Transaction used up all ${gas.to('number')} gas. Your current gas multiplier is ${this.ultralightbeam.options.gasMultiplier}.`)
    }
  })
}

TransactionMonitor.prototype.getContractAddress = function getContractAddress() {
  arguguard('transactionMonitor.getContractAddress', [], arguments)
  return this.getTransactionReceipt().then((transactionReceipt) => {
    const contractAddress = transactionReceipt.contractAddress
    return this.ultralightbeam.eth.getCode(contractAddress).then((code) => {
      if (code.to('array').length === 0) {
        throw new ContractDeploymentError('Contract did not deploy')
      }
      return contractAddress
    })
  })
}

module.exports = TransactionMonitor
