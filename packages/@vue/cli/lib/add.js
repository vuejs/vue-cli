const chalk = require('chalk')
const invoke = require('./invoke')
const { loadOptions } = require('./options')
const { installPackage } = require('./util/installDeps')
const { resolveModule, loadModule } = require('./util/module')
const {
  log,
  error,
  hasYarn,
  stopSpinner,
  resolvePluginId
} = require('@vue/cli-shared-utils')

async function add (pluginName, options = {}, context = process.cwd()) {
  // special internal "plugins"
  if (/^(@vue\/)?router$/.test(pluginName)) {
    return addRouter(context)
  }
  if (/^(@vue\/)?vuex$/.test(pluginName)) {
    return addVuex(context)
  }

  const packageName = resolvePluginId(pluginName)

  log()
  log(`📦  Installing ${chalk.cyan(packageName)}...`)
  log()

  const packageManager = loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
  await installPackage(context, packageManager, null, packageName)

  stopSpinner()

  log()
  log(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(packageName)}`)
  log()

  const generatorPath = resolveModule(`${packageName}/generator`, context)
  if (generatorPath) {
    invoke(pluginName, options, context)
  } else {
    log(`Plugin ${packageName} does not have a generator to invoke`)
  }
}

async function addRouter (context) {
  invoke.runGenerator(context, {
    id: 'core:router',
    apply: loadModule('@vue/cli-service/generator/router', context)
  })
}

async function addVuex (context) {
  invoke.runGenerator(context, {
    id: 'core:vuex',
    apply: loadModule('@vue/cli-service/generator/vuex', context)
  })
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
