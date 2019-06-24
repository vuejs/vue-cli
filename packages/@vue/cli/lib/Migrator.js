const Generator = require('./Generator')
const MigratorAPI = require('./MigratorAPI')

const inferRootOptions = require('./util/inferRootOptions')

module.exports = class Migrator extends Generator {
  constructor (context, {
    plugin,

    pkg = {},
    completeCbs = [],
    files = {},
    invoking = false
  } = {}) {
    super(context, {
      pkg,
      plugins: [],
      completeCbs,
      files,
      invoking
    })
    this.plugins = [plugin]

    const rootOptions = inferRootOptions(pkg)
    // apply migrators from plugins
    const api = new MigratorAPI(plugin.id, plugin.installed, this, plugin.options, rootOptions)
    plugin.apply(api, plugin.options, rootOptions, invoking)
  }
}
