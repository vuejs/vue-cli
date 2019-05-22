const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const globby = require('globby')
const { isBinaryFileSync } = require('isbinaryfile')
const {
  log,
  error,
  logWithSpinner,
  stopSpinner,
  failSpinner,

  isPlugin,
  loadModule,

  hasProjectGit
} = require('@vue/cli-shared-utils')

const Migrator = require('./Migrator')
const { getCommand, getVersion } = require('./util/packageManager')
const getPackageJson = require('./util/getPackageJson')
const getInstalledVersion = require('./util/getInstalledVersion')
const tryGetNewerRange = require('./util/tryGetNewerRange')
const { installDeps, installPackage } = require('./util/installDeps')
const normalizeFilePaths = require('./util/normalizeFilePaths')

async function readFiles (context) {
  const files = await globby(['**'], {
    cwd: context,
    onlyFiles: true,
    gitignore: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
    dot: true
  })
  const res = {}
  for (const file of files) {
    const name = path.resolve(context, file)
    res[file] = isBinaryFileSync(name)
      ? fs.readFileSync(name)
      : fs.readFileSync(name, 'utf-8')
  }
  return normalizeFilePaths(res)
}

async function runMigrator (packageName, options, context) {
  const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG

  const pluginMigrator = loadModule(`${packageName}/migrator`, context)
  if (!pluginMigrator) { return }

  const { registry } = options
  const plugin = {
    packageName,
    apply: migrator,
    options: {
      registry
    }
  }

  const pkg = getPackageJson(context)
  const createCompleteCbs = []
  const migrator = new Migrator(context, {
    pkg,
    plugins: [plugin],
    files: await readFiles(context),
    completeCbs: createCompleteCbs,
    invoking: true
  })

  log(`🚀  Running migrator of ${packageName}`)
  await migrator.migrate({
    extractConfigFiles: true,
    checkExisting: true
  })

  const newDeps = migrator.pkg.dependencies
  const newDevDeps = migrator.pkg.devDependencies
  const depsChanged =
    JSON.stringify(newDeps) !== JSON.stringify(pkg.dependencies) ||
    JSON.stringify(newDevDeps) !== JSON.stringify(pkg.devDependencies)

  // TODO:

  if (!isTestOrDebug && depsChanged) {
    log(`📦  Installing additional dependencies...`)
    log()
    const packageManager = getCommand(context)
    await installDeps(context, packageManager, plugin.options && plugin.options.registry)
  }

  if (createCompleteCbs.length) {
    logWithSpinner('⚓', `Running completion hooks...`)
    for (const cb of createCompleteCbs) {
      await cb()
    }
    stopSpinner()
    log()
  }

  log(`${chalk.green('✔')}  Successfully invoked migrator for plugin: ${chalk.cyan(plugin.id)}`)
  if (!process.env.VUE_CLI_TEST && hasProjectGit(context)) {
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
      log(
        `   You should review these changes with ${chalk.cyan(
          `git diff`
        )} and commit them.`
      )
      log()
    }
  }

  migrator.printExitLogs()
}

async function upgradeSinglePackage (packageName, options, context) {
  // FIXME: properly implement this
  const required = require(`${context}/package.json`).devDependencies[packageName]
  const installed = getInstalledVersion(packageName)

  let targetVersion = options.to || 'latest'

  // if the targetVersion is not an exact version
  if (!/\d+\.\d+\.\d+/.test(targetVersion)) {
    if (targetVersion === 'latest') {
      logWithSpinner(`Getting latest version of ${packageName}`)
    } else {
      logWithSpinner(`Getting max satisfying version of ${packageName}@${options.to}`)
    }

    targetVersion = await getVersion(packageName, targetVersion, options.registry, context)
    stopSpinner()
  }

  if (targetVersion === installed) {
    log(`Already installed ${packageName}@${targetVersion}`)

    const newRange = tryGetNewerRange(`^${targetVersion}`, required)
    if (newRange !== required) {
      // TODO:
      // extendPackage({ devDependencies: { packageName: newRange } })
      log(`${chalk.green('✔')}  Updated version range in ${chalk.yellow('package.json')}`)
    }
    return
  }

  log(`Upgrading ${packageName} from ${installed} to ${targetVersion}`)

  // TODO: integrate getCommand into installPackage
  const command = getCommand(context)
  await installPackage(context, command, options.registry, packageName)
  await runMigrator(packageName, { installed }, context)
}

async function upgradeAll (context) {
  // get current deps
  // filter @vue/cli-service, @vue/cli-plugin-* & vue-cli-plugin-*
  const pkg = getPackageJson(context)
  const upgradable = {
    dependencies: {},
    devDependencies: {},
    optionalDependencies: {}
  }

  logWithSpinner('Gathering update information...')
  for (const depType of Object.keys(upgradable)) {
    for (const [packageName, range] of Object.entries(pkg[depType] || {})) {
      if (packageName !== '@vue/cli-service' && !isPlugin(packageName)) {
        continue
      }

      const latest = await getVersion(packageName, 'latest', undefined, context)
      const latestRange = `^${latest}`

      if (range !== latestRange) {
        upgradable[depType][packageName] = latestRange
      }
    }
  }

  // TODO: upgrade all (interactive)
  log(upgradable)

  failSpinner()

  return Promise.reject()
}

async function upgrade (packageName, options, context = process.cwd()) {
  if (!packageName) {
    if (options.to) {
      error(`Must specify a package name to upgrade to ${options.to}`)
      process.exit(1)
    }

    return upgradeAll(context)
  }

  return upgradeSinglePackage(packageName, options, context)
}

module.exports = (...args) => {
  return upgrade(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
