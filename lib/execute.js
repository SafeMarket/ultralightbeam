const _ = require('lodash')
const Batch = require('./Batch')
const NoResultReturnedError = require('./errors').NoResultReturnedError

module.exports = function execute(ultralightbeam) {

  const batch = ultralightbeam.batch

  ultralightbeam.batch = new Batch(ultralightbeam)
  ultralightbeam.batches.push(batch)

  const payloads = batch.parts.map((batchPart) => {

    batchPart.id = ultralightbeam.id++

    const inputs = batchPart.inputs
    const inputter = batchPart.interface.inputter
    const params = inputter ? inputter.apply(ultralightbeam, inputs) : inputs

    return {
      jsonrpc: '2.0',
      id: batchPart.id,
      method: batchPart.interface.method,
      params
    }

  })

  ultralightbeam.provider.sendAsync(payloads, (err, results) => {

    if (err && !results) {
      batch.parts.forEach((batchPart) => { batchPart.deferred.reject(err) })
      batch.deferred.reject(new Error(err.message))
      return
    }

    const outputs = batch.parts.map((batchPart) => {

      const result = _.find(results, { id: batchPart.id })

      if (!result) {
        const error = new NoResultReturnedError(batchPart.id)
        batchPart.deferred.reject(error)
        return error
      }

      if (result.error) {
        batchPart.deferred.reject(new Error(result.error.message))
        return result.error
      }

      const output = batchPart.interface.outputter ?
        batchPart.interface.outputter.apply(ultralightbeam, [
          result.result,
          batchPart.inputs
        ])
        : result.result

      batchPart.deferred.resolve(output)

      return output

    })

    if (err) {
      batch.deferred.reject(err)
    } else {
      batch.deferred.resolve(outputs)
    }

  })

  return batch.promise
}
