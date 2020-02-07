const fs = require('fs')
const path = require('path')
const {
  chalk,
  semver,

  log,
  done,
  logWithSpinner,
  stopSpinner,

  isPlugin,
  resolvePluginId,

  loadModule
} = require('@vue/cli-shared-utils')

const tryGetNewerRange = require('./util/tryGetNewerRange')
const getPkg = require('./util/getPkg')
const PackageManager = require('./util/ProjectPackageManager')

const { runMigrator } = require('./migrate')

function clearRequireCache () {
  Object.keys(require.cache).forEach(key => delete require.cache[key])
}

module.exports = class Upgrader {
  constructor (context = process.cwd()) {
    this.context = context
    this.pkg = getPkg(this.context)
    this.pm = new PackageManager({ context })
  }

  async upgradeAll (includeNext) {
    // TODO: should confirm for major version upgrades
    // for patch & minor versions, upgrade directly
    // for major versions, prompt before upgrading
    const upgradable = await this.getUpgradable(includeNext)

    if (!upgradable.length) {
      done('Seems all plugins are up to date. Good work!')
      return
    }

    for (const p of upgradable) {
      // reread to avoid accidentally writing outdated package.json back
      this.pkg = getPkg(this.context)
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

    const installed = options.from || this.pm.getInstalledVersion(packageName)
    if (!installed) {
      throw new Error(
        `Can't find ${chalk.yellow(packageName)} in ${chalk.yellow('node_modules')}. Please install the dependencies first.\n` +
        `Or to force upgrade, you can specify your current plugin version with the ${chalk.cyan('--from')} option`
      )
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
      if (!options.to && options.next) {
        const next = await this.pm.getRemoteVersion(packageName, 'next')
        if (next) {
          targetVersion = semver.gte(targetVersion, next) ? targetVersion : next
        }
      }
      stopSpinner()
    }

    if (targetVersion === installed) {
      log(`Already installed ${packageName}@${targetVersion}`)

      const newRange = tryGetNewerRange(`~${targetVersion}`, required)
      if (newRange !== required) {
        this.pkg[depEntry][packageName] = newRange
        fs.writeFileSync(path.resolve(this.context, 'package.json'), JSON.stringify(this.pkg, null, 2))
        log(`${chalk.green('✔')}  Updated version range in ${chalk.yellow('package.json')}`)
      }
      return
    }

    log(`Upgrading ${packageName} from ${installed} to ${targetVersion}`)
    await this.pm.upgrade(`${packageName}@~${targetVersion}`)
    // as the dependencies have now changed, the require cache must be invalidated
    // otherwise it may affect the behavior of the migrator
    clearRequireCache()

    // The cached `pkg` field won't automatically update after running `this.pm.upgrade`.
    // Also, `npm install pkg@~version` won't replace the original `"pkg": "^version"` field.
    // So we have to manually update `this.pkg` and write to the file system in `runMigrator`
    this.pkg[depEntry][packageName] = `~${targetVersion}`
    const noop = () => {}

    const pluginMigrator =
      loadModule(`${packageName}/migrator`, this.context) || noop

    await runMigrator(
      this.context,
      {
        id: packageName,
        apply: pluginMigrator,
        baseVersion: installed
      },
      this.pkg
    )
  }

  async getUpgradable (includeNext) {
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

        if (!installed) {
          throw new Error(`At least one dependency can't be found. Please install the dependencies before trying to upgrade`)
        }

        let latest = await this.pm.getRemoteVersion(name)
        if (includeNext) {
          const next = await this.pm.getRemoteVersion(name, 'next')
          if (next) {
            latest = semver.gte(latest, next) ? latest : next
          }
        }

        if (semver.lt(installed, latest)) {
          // always list @vue/cli-service as the first one
          // as it's depended by all other plugins
          if (name === '@vue/cli-service') {
            upgradable.unshift({ name, installed, wanted, latest })
          } else {
            upgradable.push({ name, installed, wanted, latest })
          }
        }
      }
    }

    return upgradable
  }

  async checkForUpdates (includeNext) {
    logWithSpinner('Gathering package information...')
    const upgradable = await this.getUpgradable(includeNext)
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
    const pads = [namePad, 16, 16, 16, 0]
    console.log(
      '  ' +
      ['Name', 'Installed', 'Wanted', 'Latest', 'Command to upgrade'].map(
        (x, i) => chalk.underline(x.padEnd(pads[i]))
      ).join('')
    )
    for (const p of upgradable) {
      const fields = [
        p.name,
        p.installed || 'N/A',
        p.wanted,
        p.latest,
        `vue upgrade ${p.name}${includeNext ? ' --next' : ''}`
      ]
      // TODO: highlight the diff part, like in `yarn outdated`
      console.log('  ' + fields.map((x, i) => x.padEnd(pads[i])).join(''))
    }

    return upgradable
  }
}
