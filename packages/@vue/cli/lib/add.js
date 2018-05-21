const chalk = require('chalk')
const invoke = require('./invoke')
const { loadOptions } = require('./options')
const { installPackage } = require('./util/installDeps')
const { resolveModule } = require('./util/module')
const {
  log,
  error,
  warn,
  hasYarn,
  stopSpinner,
  resolvePluginId
} = require('@vue/cli-shared-utils')

// vuex and vue-router are internally added via cli-service so they need to be handled differently
const internalPluginRE = /^(vuex|router)$/

async function add (pluginName, options = {}, context = process.cwd()) {
  let packageName
  const internalPlugin = internalPluginRE.test(pluginName)
  if (internalPlugin) {
    packageName = pluginName.replace(/router/, 'vue-router')
  } else {
    packageName = resolvePluginId(pluginName)
  }

  log()
  log(`📦  Installing ${chalk.cyan(packageName)}...`)
  log()

  const packageManager = loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
  await installPackage(context, packageManager, null, packageName, !internalPlugin)

  stopSpinner()

  log()
  log(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(packageName)}`)
  log()

  const generatorPath = resolveModule(`${packageName}/generator`, context)
  if (generatorPath) {
    invoke(pluginName, options, context)
  } else if (internalPlugin) {
    log()
    warn(`Internal Plugin: ${packageName} cannot modify files post creation. See https://${pluginName}.vuejs.org for instructions to add ${packageName} to your code`)
    log()
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
