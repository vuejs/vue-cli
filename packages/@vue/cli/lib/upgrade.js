const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
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
const { installDeps, updatePackage } = require('./util/installDeps')

const getPackageJson = require('./util/getPackageJson')
const getInstalledVersion = require('./util/getInstalledVersion')
const tryGetNewerRange = require('./util/tryGetNewerRange')
const readFiles = require('./util/readFiles')

async function runMigrator (packageName, options, context) {
  const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG

  const pluginMigrator = loadModule(`${packageName}/migrator`, context)
  if (!pluginMigrator) { return }

  const plugin = {
    packageName,
    apply: migrator
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
    await installDeps(context, packageManager)
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
  const pkg = getPackageJson(context)
  let depEntry, required
  for (const depType of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    if (pkg[depType] && pkg[depType][packageName]) {
      depEntry = depType
      required = pkg[depType][packageName]
      break
    }
  }
  if (!required) {
    throw new Error(`Can't find ${chalk.yellow(packageName)} in ${chalk.yellow('package.json')}`)
  }
  const installed = getInstalledVersion(packageName)

  let targetVersion = options.to || 'latest'

  // if the targetVersion is not an exact version
  if (!/\d+\.\d+\.\d+/.test(targetVersion)) {
    if (targetVersion === 'latest') {
      logWithSpinner(`Getting latest version of ${packageName}`)
    } else {
      logWithSpinner(`Getting max satisfying version of ${packageName}@${options.to}`)
    }

    targetVersion = await getVersion(packageName, targetVersion, context)
    stopSpinner()
  }

  if (targetVersion === installed) {
    log(`Already installed ${packageName}@${targetVersion}`)

    const newRange = tryGetNewerRange(`^${targetVersion}`, required)
    if (newRange !== required) {
      pkg[depEntry][packageName] = newRange
      fs.writeFileSync(path.resolve(context, 'package.json'), JSON.stringify(pkg, null, 2))
      log(`${chalk.green('✔')}  Updated version range in ${chalk.yellow('package.json')}`)
    }
    return
  }

  log(`Upgrading ${packageName} from ${installed} to ${targetVersion}`)

  await updatePackage(context, getCommand(context), `${packageName}@^${targetVersion}`)
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

  // TODO: format the output
  // https://github.com/angular/angular-cli/blob/34a55c96b2ed38b226879913839b97c601387653/packages/schematics/update/update/index.ts#L490-L509
  log(upgradable)

  // TODO: upgrade all (interactive)
  // for patch & minor versions, upgrade directly
  // for major versions, prompt before upgrading

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
