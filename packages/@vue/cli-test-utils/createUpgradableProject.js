const fs = require('fs')
const path = require('path')
const execa = require('execa')

const createTestProject = require('./createTestProject')
const Upgrader = require('@vue/cli/lib/Upgrader')

const outsideTestFolder = path.resolve(__dirname, '../../../../vue-upgrade-tests')

/**
 * create upgradable project
 * @param  {string} name
 * @param  {import('@vue/cli').Preset} preset
 * @returns {ReturnType<createTestProject> & Promise<{upgrade:  Upgrader['upgrade']}>}
 */
module.exports = async function createUpgradableProject (name, preset) {
  if (!fs.existsSync(outsideTestFolder)) {
    fs.mkdirSync(outsideTestFolder)
  }
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true

  const project = await createTestProject(name, preset, outsideTestFolder)
  const upgrade = async function upgrade (pluginName, options) {
    return (new Upgrader(project.dir)).upgrade(pluginName, options || {})
  }

  project.run = (command) => {
    let cmdArgs
    [command, ...cmdArgs] = command.split(/\s+/)
    if (command === 'vue-cli-service') {
      // appveyor has problem with paths sometimes
      command = 'yarn'
      cmdArgs.unshift('vue-cli-service')
    }
    return execa(command, cmdArgs, { cwd: project.dir })
  }

  return {
    ...project,
    upgrade
  }
}
