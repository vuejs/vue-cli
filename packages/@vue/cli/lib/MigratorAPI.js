const { semver } = require('@vue/cli-shared-utils')
const GeneratorAPI = require('./GeneratorAPI')

class MigratorAPI extends GeneratorAPI {
  /**
   * @param {string} id - Id of the owner plugin
   * @param {Migrator} migrator - The invoking Migrator instance
   * @param {object} options - options passed to this plugin
   * @param {object} rootOptions - root options (the entire preset)
   */
  constructor (id, installedVersion, migrator, options, rootOptions) {
    super(id, migrator, options, rootOptions)

    this.installedVersion = installedVersion
    this.migrator = this.generator
  }

  fromVersion (range) {
    return semver.satisfies(this.installedVersion, range)
  }
}

module.exports = MigratorAPI
