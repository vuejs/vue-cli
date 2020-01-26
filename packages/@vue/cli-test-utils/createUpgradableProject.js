const fs = require('fs')
const path = require('path')

const createTestProject = require('./createTestProject')
const Upgrader = require('@vue/cli/lib/Upgrader')

const outsideTestFolder = path.resolve(__dirname, '../../../../vue-upgrade-tests')

module.exports = async function createUpgradableProject (...args) {
  if (!fs.existsSync(outsideTestFolder)) {
    fs.mkdirSync(outsideTestFolder)
  }
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true

  const project = await createTestProject(...args, outsideTestFolder)
  const upgrade = async function upgrade (pluginName, options) {
    return (new Upgrader(project.dir)).upgrade(pluginName, options || {})
  }

  return {
    ...project,
    upgrade
  }
}
