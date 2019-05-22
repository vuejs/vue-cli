const Generator = require('./Generator')

module.exports = class Migrator extends Generator {
  constructor (context, options) {
    super(context, options)
    this.migrate = this.generate
  }
}
