const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const resolve = require('resolve')
const Generator = require('./Generator')
const { loadOptions } = require('./options')
const installDeps = require('./util/installDeps')
const clearConsole = require('./util/clearConsole')
const {
  log,
  error,
  hasYarn,
  logWithSpinner,
  stopSpinner
} = require('@vue/cli-shared-utils')

async function invoke (pluginName, options) {
  delete options._
  const context = process.cwd()
  const pkgPath = path.resolve(context, 'package.json')

  if (!fs.existsSync(pkgPath)) {
    error(`package.json not found in ${chalk.yellow(context)}`)
    process.exit(1)
  }

  const pkg = require(pkgPath)

  // attempt to locate the plugin in package.json
  const findPlugin = deps => {
    if (!deps) return
    let name
    if (deps[name = pluginName] ||
        deps[name = `@vue/cli-plugin-${pluginName}`] ||
        deps[name = `vue-cli-plugin-${pluginName}`]) {
      return name
    }
  }
  const resolvedPluginName = (
    findPlugin(pkg.devDependencies) ||
    findPlugin(pkg.dependencies)
  )

  if (!resolvedPluginName) {
    error(`Cannot resolve plugin ${chalk.yellow(pluginName)} from package.json.`)
    process.exit(1)
  }

  const generatorURI = `${resolvedPluginName}/generator`
  const generatorPath = resolve.sync(generatorURI, { basedir: context })
  const plugin = {
    id: resolvedPluginName,
    apply: require(generatorPath),
    options
  }

  const createCompleteCbs = []
  const generator = new Generator(
    context,
    pkg,
    [plugin],
    createCompleteCbs
  )

  clearConsole()
  logWithSpinner('🚀', `Invoking generator for ${resolvedPluginName}...`)
  await generator.generate()

  const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG
  const newDeps = generator.pkg.dependencies
  const newDevDeps = generator.pkg.devDependencies
  const depsChanged = (
    JSON.stringify(newDeps) !== JSON.stringify(pkg.dependencies) ||
    JSON.stringify(newDevDeps) !== JSON.stringify(pkg.devDependencies)
  )

  if (!isTestOrDebug && depsChanged) {
    logWithSpinner('📦', `Installing additional dependencies...`)
    const packageManager = loadOptions().packageManager || (hasYarn ? 'yarn' : 'npm')
    await installDeps(context, packageManager)
  }

  if (createCompleteCbs.length) {
    logWithSpinner('⚓', `Running completion hooks...`)
    for (const cb of createCompleteCbs) {
      await cb()
    }
  }

  stopSpinner()
  log()
  log(`   Successfully invoked generator for plugin: ${chalk.cyan(resolvedPluginName)}`)
  log(`   You should review and commit the changes.`)
  log()
}

module.exports = (pluginName, options) => {
  invoke(pluginName, options).catch(err => {
    error(err)
    process.exit(1)
  })
}
