const chai = require('chai')

chai.use((chai, utils) => {
  utils.addChainableMethod(chai.Assertion.prototype, 'amorphTo', function (form) {
    this._obj = this._obj.to(form)
  })

  utils.addMethod(chai.Assertion.prototype, 'amorphEqual', function (amorph, _form) {
    const form = _form || amorph.form
    const expected = amorph.to(form)
    const actual = this._obj.to(form)

    this.assert(
      amorph.to(form) === this._obj.to(form),
      `expected ${expected} to equal ${actual}`,
      `expected ${expected} to not equal ${actual}`
    )
  })
})
chai.use(require('chai-web3-bindings'))
chai.use(require('chai-as-promised'))
chai.should()

module.exports = chai