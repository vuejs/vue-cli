const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const {
  log,
  error,
  done,

  logWithSpinner,
  stopSpinner,

  isPlugin,
  resolvePluginId,
  loadModule,

  hasProjectGit
} = require('@vue/cli-shared-utils')

const Migrator = require('./Migrator')

const { getCommand, getVersion } = require('./util/packageManager')
const { installDeps, updatePackage } = require('./util/installDeps')
const { linkPackage } = require('./util/linkBin')

const getPackageJson = require('./util/getPackageJson')
const getInstalledVersion = require('./util/getInstalledVersion')
const tryGetNewerRange = require('./util/tryGetNewerRange')
const readFiles = require('./util/readFiles')

const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG

async function runMigrator (packageName, options, context) {
  const pluginMigrator = loadModule(`${packageName}/migrator`, context)
  if (!pluginMigrator) { return }

  const plugin = {
    id: packageName,
    apply: pluginMigrator,
    installed: options.installed
  }

  const pkg = getPackageJson(context)
  const createCompleteCbs = []
  const migrator = new Migrator(context, {
    plugin: plugin,

    pkg,
    files: await readFiles(context),
    completeCbs: createCompleteCbs,
    invoking: true
  })

  log(`🚀  Running migrator of ${packageName}`)
  await migrator.generate({
    extractConfigFiles: true,
    checkExisting: true
  })

  const newDeps = migrator.pkg.dependencies
  const newDevDeps = migrator.pkg.devDependencies
  const depsChanged =
    JSON.stringify(newDeps) !== JSON.stringify(pkg.dependencies) ||
    JSON.stringify(newDevDeps) !== JSON.stringify(pkg.devDependencies)

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

async function upgradeSinglePackage (pluginId, options, context) {
  const packageName = resolvePluginId(pluginId)
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

  if (isTestOrDebug) {
    // link packages in current repo for test
    await linkPackage(path.resolve(__dirname, `../../../${packageName}`), path.join(context, 'node_modules', packageName))
  } else {
    await updatePackage(context, getCommand(context), `${packageName}@^${targetVersion}`)
  }

  await runMigrator(packageName, { installed }, context)
}

async function getUpgradable (context) {
  // get current deps
  // filter @vue/cli-service, @vue/cli-plugin-* & vue-cli-plugin-*
  const pkg = getPackageJson(context)
  const upgradable = []

  for (const depType of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    for (const [name, range] of Object.entries(pkg[depType] || {})) {
      if (name !== '@vue/cli-service' && !isPlugin(name)) {
        continue
      }

      const installed = await getInstalledVersion(name)
      const wanted = await getVersion(name, range, context)
      const latest = await getVersion(name, 'latest', context)

      if (installed !== latest) {
        upgradable.push({ name, installed, wanted, latest })
      }
    }
  }

  return upgradable
}

async function checkForUpdates (context) {
  logWithSpinner('Gathering pacakage information...')
  const upgradable = await getUpgradable(context)
  stopSpinner()

  if (!upgradable.length) {
    done('Seems all plugins are up to date. Good work!')
    return
  }

  // format the output
  // adapted from @angular/cli
  const names = upgradable.map(dep => dep.name)
  let namePad = Math.max(...names.map(x => x.length)) + 2
  if (!Number.isFinite(namePad)) {
    namePad = 30
  }
  const pads = [namePad, 12, 12, 12, 0]
  console.log(
    '  ' +
    ['Name', 'Installed', 'Wanted', 'Latest', 'Command to upgrade'].map(
      (x, i) => chalk.underline(x.padEnd(pads[i]))
    ).join('')
  )
  for (const p of upgradable) {
    const fields = [p.name, p.installed, p.wanted, p.latest, `vue upgrade ${p.name}`]
    console.log('  ' + fields.map((x, i) => x.padEnd(pads[i])).join(''))
  }

  console.log(`Run ${chalk.yellow('vue upgrade --all')} to upgrade all the above plugins`)

  return upgradable
}

async function upgradeAll (context) {
  // TODO: should confirm for major version upgrades
  // for patch & minor versions, upgrade directly
  // for major versions, prompt before upgrading
  const upgradable = await getUpgradable(context)

  if (!upgradable.length) {
    done('Seems all plugins are up to date. Good work!')
    return
  }

  for (const p of upgradable) {
    await upgradeSinglePackage(p.name, { to: p.latest }, context)
  }

  done('All plugins are up to date!')
}

async function upgrade (packageName, options, context = process.cwd()) {
  if (!packageName) {
    if (options.to) {
      error(`Must specify a package name to upgrade to ${options.to}`)
      process.exit(1)
    }

    if (options.all) {
      return upgradeAll(context)
    }

    return checkForUpdates(context)
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
