const fs = require('fs')
const path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const globby = require('globby')
const inquirer = require('inquirer')
const isBinary = require('isbinaryfile')
const Generator = require('./Generator')
const { loadOptions } = require('./options')
const { installDeps } = require('./util/installDeps')
const { loadModule } = require('./util/module')
const {
  log,
  error,
  hasYarn,
  hasGit,
  logWithSpinner,
  stopSpinner,
  resolvePluginId
} = require('@vue/cli-shared-utils')

async function readFiles (context) {
  const files = await globby(['**'], {
    cwd: context,
    onlyFiles: true,
    gitignore: true,
    ignore: ['**/node_modules/**']
  })
  const res = {}
  for (const file of files) {
    const name = path.resolve(context, file)
    res[file] = isBinary.sync(name)
      ? fs.readFileSync(name)
      : fs.readFileSync(name, 'utf-8')
  }
  return res
}

function getPkg (context) {
  const pkgPath = path.resolve(context, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in ${chalk.yellow(context)}`)
  }
  return loadModule(pkgPath, context, true)
}

async function invoke (pluginName, options = {}, context = process.cwd()) {
  delete options._
  const pkg = getPkg(context)

  // attempt to locate the plugin in package.json
  const findPlugin = deps => {
    if (!deps) return
    let name
    // official
    if (deps[(name = `@vue/cli-plugin-${pluginName}`)]) {
      return name
    }
    // full id, scoped short, or default short
    if (deps[(name = resolvePluginId(pluginName))]) {
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

  const pluginGenerator = loadModule(`${id}/generator`, context)
  if (!pluginGenerator) {
    throw new Error(`Plugin ${id} does not have a generator.`)
  }

  // resolve options if no command line options are passed, and the plugin
  // contains a prompt module.
  if (!Object.keys(options).length) {
    const pluginPrompts = loadModule(`${id}/prompts`, context)
    if (pluginPrompts) {
      options = await inquirer.prompt(pluginPrompts)
    }
  }

  const plugin = {
    id,
    apply: pluginGenerator,
    options
  }

  await runGenerator(context, plugin, pkg)
}

async function runGenerator (context, plugin, pkg = getPkg(context)) {
  const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG
  const createCompleteCbs = []
  const generator = new Generator(context, {
    pkg,
    plugins: [plugin],
    files: await readFiles(context),
    completeCbs: createCompleteCbs,
    invoking: true
  })

  log()
  logWithSpinner('🚀', `Invoking generator for ${plugin.id}...`)
  await generator.generate({
    extractConfigFiles: true,
    checkExisting: true
  })

  const newDeps = generator.pkg.dependencies
  const newDevDeps = generator.pkg.devDependencies
  const depsChanged =
    JSON.stringify(newDeps) !== JSON.stringify(pkg.dependencies) ||
    JSON.stringify(newDevDeps) !== JSON.stringify(pkg.devDependencies)

  if (!isTestOrDebug && depsChanged) {
    logWithSpinner('📦', `Installing additional dependencies...`)
    const packageManager =
      loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
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
  log(`   Successfully invoked generator for plugin: ${chalk.cyan(plugin.id)}`)
  if (!process.env.VUE_CLI_TEST && hasGit()) {
    const { stdout } = await execa('git', [
      'ls-files',
      '--exclude-standard',
      '--modified',
      '--others'
    ], {
      cwd: context
    })
    if (stdout.trim()) {
      log(`   The following files have been updated / added:\n`)
      log(
        chalk.red(
          stdout
            .split(/\r?\n/g)
            .map(line => `     ${line}`)
            .join('\n')
        )
      )
      log()
    }
  }
  log(
    `   You should review these changes with ${chalk.cyan(
      `git diff`
    )} and commit them.`
  )
  log()

  generator.printExitLogs()
}

module.exports = (...args) => {
  return invoke(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}

module.exports.runGenerator = runGenerator
