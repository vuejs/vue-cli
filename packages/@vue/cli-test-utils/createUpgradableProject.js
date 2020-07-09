const createTestProject = require('./createTestProject')
const Upgrader = require('@vue/cli/lib/Upgrader')

module.exports = async function createUpgradableProject (...args) {
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true

  const project = await createTestProject(...args)
  const upgrade = async function upgrade (pluginName, options) {
    return (new Upgrader(project.dir)).upgrade(pluginName, options || {})
  }

  return {
    ...project,
    upgrade
  }
}
