const chalk = require('chalk')
const invoke = require('./invoke')
const { loadOptions } = require('@vue/cli-utils/lib/options')
const { installPackage } = require('@vue/cli-utils/lib/util/installDeps')
const {
  log,
  error,
  hasProjectYarn,
  hasProjectPnpm,
  resolvePluginId,
  resolveModule
} = require('@vue/cli-shared-utils')

async function add (pluginName, options = {}, context = process.cwd()) {
  const packageName = resolvePluginId(pluginName)

  log()
  log(`📦  Installing ${chalk.cyan(packageName)}...`)
  log()

  const packageManager = loadOptions().packageManager || (hasProjectYarn(context) ? 'yarn' : hasProjectPnpm(context) ? 'pnpm' : 'npm')
  await installPackage(context, packageManager, packageName)

  log(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(packageName)}`)
  log()

  const generatorPath = resolveModule(`${packageName}/generator`, context)
  if (generatorPath) {
    invoke(pluginName, options, context)
  } else {
    log(`Plugin ${packageName} does not have a generator to invoke`)
  }
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
