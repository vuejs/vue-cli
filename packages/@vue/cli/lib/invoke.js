const fs = require('fs')
const path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const resolve = require('resolve')
const inquirer = require('inquirer')
const Generator = require('./Generator')
const { loadOptions } = require('./options')
const { installDeps } = require('./util/installDeps')
const {
  log,
  error,
  hasYarn,
  hasGit,
  logWithSpinner,
  stopSpinner
} = require('@vue/cli-shared-utils')

function load (request, context) {
  let resolvedPath
  try {
    resolvedPath = resolve.sync(request, { basedir: context })
  } catch (e) {}
  if (resolvedPath) {
    return require(resolvedPath)
  }
}

async function invoke (pluginName, options = {}, context = process.cwd()) {
  delete options._
  const pkgPath = path.resolve(context, 'package.json')
  const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG

  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in ${chalk.yellow(context)}`)
  }

  const pkg = require(pkgPath)

  // attempt to locate the plugin in package.json
  const findPlugin = deps => {
    if (!deps) return
    let name
    if (deps[name = `@vue/cli-plugin-${pluginName}`] ||
        deps[name = `vue-cli-plugin-${pluginName}`] ||
        deps[name = pluginName]) {
      return name
    }
  }

  const id = findPlugin(pkg.devDependencies) || findPlugin(pkg.dependencies)
  if (!id) {
    throw new Error(
      `Cannot resolve plugin ${chalk.yellow(pluginName)} from package.json. ` +
      `Did you forget to install it?`
    )
  }

  const pluginGenerator = load(`${id}/generator`, context)
  if (!pluginGenerator) {
    throw new Error(`Plugin ${id} does not have a generator.`)
  }

  // resolve options if no command line options are passed, and the plugin
  // contains a prompt module.
  if (!Object.keys(options).length) {
    const pluginPrompts = load(`${id}/prompts`, context)
    if (pluginPrompts) {
      options = await inquirer.prompt(pluginPrompts)
    }
  }

  const plugin = {
    id,
    apply: pluginGenerator,
    options
  }

  const createCompleteCbs = []
  const generator = new Generator(
    context,
    pkg,
    [plugin],
    createCompleteCbs
  )

  log()
  logWithSpinner('🚀', `Invoking generator for ${id}...`)
  await generator.generate({
    extractConfigFiles: true,
    checkExisting: true
  })

  const newDeps = generator.pkg.dependencies
  const newDevDeps = generator.pkg.devDependencies
  const depsChanged = (
    JSON.stringify(newDeps) !== JSON.stringify(pkg.dependencies) ||
    JSON.stringify(newDevDeps) !== JSON.stringify(pkg.devDependencies)
  )

  if (!isTestOrDebug && depsChanged) {
    logWithSpinner('📦', `Installing additional dependencies...`)
    const packageManager = loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
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
  log(`   Successfully invoked generator for plugin: ${chalk.cyan(id)}`)
  if (!process.env.VUE_CLI_TEST && hasGit()) {
    const { stdout } = await execa('git', ['ls-files', '--exclude-standard', '--modified', '--others'])
    if (stdout.trim()) {
      log(`   The following files have been updated / added:\n`)
      log(chalk.red(stdout.split(/\r?\n/g).map(line => `     ${line}`).join('\n')))
      log()
    }
  }
  log(`   You should review and commit the changes.`)
  log()
}

module.exports = (...args) => {
  return invoke(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
