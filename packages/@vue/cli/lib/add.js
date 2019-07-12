const chalk = require('chalk')
const invoke = require('./invoke')

const PackageManager = require('./util/ProjectPackageManager')
const {
  log,
  error,
  resolvePluginId
} = require('@vue/cli-shared-utils')
const confirmIfGitDirty = require('./util/confirmIfGitDirty')

async function add (pluginName, options = {}, context = process.cwd()) {
  if (!(await confirmIfGitDirty(context))) {
    return
  }

  const packageName = resolvePluginId(pluginName)

  log()
  log(`📦  Installing ${chalk.cyan(packageName)}...`)
  log()

  const pm = new PackageManager({ context })
  await pm.add(packageName)

  log(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(packageName)}`)
  log()

  invoke(pluginName, options, context)
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
