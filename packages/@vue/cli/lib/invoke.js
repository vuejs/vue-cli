const inquirer = require('inquirer')
const {
  chalk,

  log,
  error,
  logWithSpinner,
  stopSpinner,

  resolvePluginId,

  loadModule
} = require('@vue/cli-shared-utils')

const Generator = require('./Generator')

const confirmIfGitDirty = require('./util/confirmIfGitDirty')
const readFiles = require('./util/readFiles')
const getPkg = require('./util/getPkg')
const getChangedFiles = require('./util/getChangedFiles')
const PackageManager = require('./util/ProjectPackageManager')

async function invoke (pluginName, options = {}, context = process.cwd()) {
  if (!(await confirmIfGitDirty(context))) {
    return
  }

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

  // resolve options if no command line options (other than --registry) are passed,
  // and the plugin contains a prompt module.
  // eslint-disable-next-line prefer-const
  let { registry, $inlineOptions, ...pluginOptions } = options
  if ($inlineOptions) {
    try {
      pluginOptions = JSON.parse($inlineOptions)
    } catch (e) {
      throw new Error(`Couldn't parse inline options JSON: ${e.message}`)
    }
  } else if (!Object.keys(pluginOptions).length) {
    let pluginPrompts = loadModule(`${id}/prompts`, context)
    if (pluginPrompts) {
      if (typeof pluginPrompts === 'function') {
        pluginPrompts = pluginPrompts(pkg)
      }
      if (typeof pluginPrompts.getPrompts === 'function') {
        pluginPrompts = pluginPrompts.getPrompts(pkg)
      }
      pluginOptions = await inquirer.prompt(pluginPrompts)
    }
  }

  const plugin = {
    id,
    apply: pluginGenerator,
    options: {
      registry,
      ...pluginOptions
    }
  }

  await runGenerator(context, plugin, pkg)
}

async function runGenerator (context, plugin, pkg = getPkg(context)) {
  const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG
  const afterInvokeCbs = []
  const afterAnyInvokeCbs = []

  const generator = new Generator(context, {
    pkg,
    plugins: [plugin],
    files: await readFiles(context),
    afterInvokeCbs,
    afterAnyInvokeCbs,
    invoking: true
  })

  log()
  log(`🚀  Invoking generator for ${plugin.id}...`)
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
    log(`📦  Installing additional dependencies...`)
    log()
    const pm = new PackageManager({ context })
    await pm.install()
  }

  if (afterInvokeCbs.length || afterAnyInvokeCbs.length) {
    logWithSpinner('⚓', `Running completion hooks...`)
    for (const cb of afterInvokeCbs) {
      await cb()
    }
    for (const cb of afterAnyInvokeCbs) {
      await cb()
    }
    stopSpinner()
    log()
  }

  log(`${chalk.green('✔')}  Successfully invoked generator for plugin: ${chalk.cyan(plugin.id)}`)
  const changedFiles = getChangedFiles(context)
  if (changedFiles.length) {
    log(`   The following files have been updated / added:\n`)
    log(chalk.red(changedFiles.map(line => `     ${line}`).join('\n')))
    log()
    log(
      `   You should review these changes with ${chalk.cyan(
        'git diff'
      )} and commit them.`
    )
    log()
  }

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
