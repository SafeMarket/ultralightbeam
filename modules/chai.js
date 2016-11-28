const chai = require('chai')

chai.use((chai, utils) => {
  utils.addChainableMethod(chai.Assertion.prototype, 'amorphTo', function (form) {
    this._obj = this._obj.to(form)
  })
})
chai.use(require('chai-web3-bindings'))
chai.use(require('chai-as-promised'))
chai.should()

module.exports = chai