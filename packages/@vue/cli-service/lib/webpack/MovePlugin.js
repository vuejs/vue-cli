const fs = require('fs-extra')

module.exports = class MovePlugin {
  constructor (from, to) {
    this.from = from
    this.to = to
  }

  apply (compiler) {
    compiler.hooks.done.tap('move-plugin', () => {
      fs.moveSync(this.from, this.to, { overwrite: true })
    })
  }
}
