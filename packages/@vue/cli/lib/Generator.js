const path = require('path')

module.exports = class Generator {
  constructor (id, requirePath = id) {
    this.id = id
    this.path = path.dirname(require.resolve(requirePath))
    this.module = require(requirePath)
  }
}
