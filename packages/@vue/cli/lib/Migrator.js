const Generator = require('./Generator')
const MigratorAPI = require('./MigratorAPI')

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

    this.migratorPlugin = plugin
    this.invoking = invoking
  }

  async generate () {
    const plugin = this.migratorPlugin

    // apply migrators from plugins
    const api = new MigratorAPI(
      plugin.id,
      plugin.installed,
      this,
      plugin.options,
      this.rootOptions
    )

    await plugin.apply(api, plugin.options, this.rootOptions, this.invoking)

    await super.generate()
  }
}
