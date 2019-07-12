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
const tryGetNewerRange = require('./util/tryGetNewerRange')
const readFiles = require('./util/readFiles')
const confirmIfGitDirty = require('./util/confirmIfGitDirty')

const getPackageJson = require('./util/getPackageJson')
const PackageManager = require('./util/ProjectPackageManager')

const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG

class Upgrader {
  constructor (context = process.cwd()) {
    this.context = context
    this.pkg = getPackageJson(this.context)
    this.pm = new PackageManager({ context })
  }

  async upgradeAll () {
    // TODO: should confirm for major version upgrades
    // for patch & minor versions, upgrade directly
    // for major versions, prompt before upgrading
    const upgradable = await this.getUpgradable()

    if (!upgradable.length) {
      done('Seems all plugins are up to date. Good work!')
      return
    }

    for (const p of upgradable) {
      await this.upgrade(p.name, { to: p.latest })
    }

    done('All plugins are up to date!')
  }

  async upgrade (pluginId, options) {
    const packageName = resolvePluginId(pluginId)

    let depEntry, required
    for (const depType of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      if (this.pkg[depType] && this.pkg[depType][packageName]) {
        depEntry = depType
        required = this.pkg[depType][packageName]
        break
      }
    }
    if (!required) {
      throw new Error(`Can't find ${chalk.yellow(packageName)} in ${chalk.yellow('package.json')}`)
    }

    let targetVersion = options.to || 'latest'
    // if the targetVersion is not an exact version
    if (!/\d+\.\d+\.\d+/.test(targetVersion)) {
      if (targetVersion === 'latest') {
        logWithSpinner(`Getting latest version of ${packageName}`)
      } else {
        logWithSpinner(`Getting max satisfying version of ${packageName}@${options.to}`)
      }

      targetVersion = await this.pm.getRemoteVersion(packageName, targetVersion)
      stopSpinner()
    }

    const installed = this.pm.getInstalledVersion(packageName)
    if (targetVersion === installed) {
      log(`Already installed ${packageName}@${targetVersion}`)

      const newRange = tryGetNewerRange(`^${targetVersion}`, required)
      if (newRange !== required) {
        this.pkg[depEntry][packageName] = newRange
        fs.writeFileSync(path.resolve(this.context, 'package.json'), JSON.stringify(this.pkg, null, 2))
        log(`${chalk.green('✔')}  Updated version range in ${chalk.yellow('package.json')}`)
      }
      return
    }

    log(`Upgrading ${packageName} from ${installed} to ${targetVersion}`)
    await this.pm.upgrade(`${packageName}@^${targetVersion}`)

    await this.runMigrator(packageName, { installed })
  }

  async runMigrator (packageName, options) {
    const pluginMigrator = loadModule(`${packageName}/migrator`, this.context)
    if (!pluginMigrator) { return }

    const plugin = {
      id: packageName,
      apply: pluginMigrator,
      installed: options.installed
    }

    const createCompleteCbs = []
    const migrator = new Migrator(this.context, {
      plugin: plugin,

      pkg: this.pkg,
      files: await readFiles(this.context),
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
      JSON.stringify(newDeps) !== JSON.stringify(this.pkg.dependencies) ||
      JSON.stringify(newDevDeps) !== JSON.stringify(this.pkg.devDependencies)

    if (!isTestOrDebug && depsChanged) {
      log(`📦  Installing additional dependencies...`)
      log()
      await this.pm.install()
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
    if (!process.env.VUE_CLI_TEST && hasProjectGit(this.context)) {
      const { stdout } = await execa('git', [
        'ls-files',
        '--exclude-standard',
        '--modified',
        '--others'
      ], {
        cwd: this.context
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

  async getUpgradable () {
    const upgradable = []

    // get current deps
    // filter @vue/cli-service, @vue/cli-plugin-* & vue-cli-plugin-*
    for (const depType of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      for (const [name, range] of Object.entries(this.pkg[depType] || {})) {
        if (name !== '@vue/cli-service' && !isPlugin(name)) {
          continue
        }

        const installed = await this.pm.getInstalledVersion(name)
        const wanted = await this.pm.getRemoteVersion(name, range)

        const latest = await this.pm.getRemoteVersion(name)

        if (installed !== latest) {
          upgradable.push({ name, installed, wanted, latest })
        }
      }
    }

    return upgradable
  }

  async checkForUpdates () {
    logWithSpinner('Gathering pacakage information...')
    const upgradable = await this.getUpgradable()
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
      // TODO: highlight the diff part, like in `yarn outdated`
      console.log('  ' + fields.map((x, i) => x.padEnd(pads[i])).join(''))
    }

    console.log(`Run ${chalk.yellow('vue upgrade --all')} to upgrade all the above plugins`)

    return upgradable
  }
}

async function upgrade (packageName, options, context = process.cwd()) {
  if (!(await confirmIfGitDirty(context))) {
    return
  }
  
  const upgrader = new Upgrader(context)

  if (!packageName) {
    if (options.to) {
      error(`Must specify a package name to upgrade to ${options.to}`)
      process.exit(1)
    }

    if (options.all) {
      return upgrader.upgradeAll()
    }

    return upgrader.checkForUpdates()
  }

  return upgrader.upgrade(packageName, options)
}

module.exports = (...args) => {
  return upgrade(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
