const fs = require('fs')
const path = require('path')

const chalk = require('chalk')
const Table = require('cli-table')
const inquirer = require('inquirer')

/* eslint-disable node/no-extraneous-require */
const {
  hasYarn,
  logWithSpinner,
  stopSpinner
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')
const { installDeps } = require('@vue/cli/lib/util/installDeps')
/* eslint-enable node/no-extraneous-require */

const getPackageJson = require('./get-package-json')
const getInstalledVersion = require('./get-installed-version')
const getUpgradableVersion = require('./get-upgradable-version')

const projectPath = process.cwd()

// - Resolve the version to upgrade to.
// - `vue upgrade [patch|minor|major]`: defaults to minor
// - If already latest, print message and exit
// - Otherwise, confirm via prompt

function isCorePackage (packageName) {
  return (
    packageName === '@vue/cli-service' ||
    packageName.startsWith('@vue/cli-plugin-')
  )
}

function shouldUseYarn () {
  // infer from lockfiles first
  if (fs.existsSync(path.resolve(projectPath, 'package-lock.json'))) {
    return false
  }

  if (fs.existsSync(path.resolve(projectPath, 'yarn.lock')) && hasYarn()) {
    return true
  }

  // fallback to packageManager field in ~/.vuerc
  const { packageManager } = loadOptions()
  if (packageManager) {
    return packageManager === 'yarn'
  }

  return hasYarn()
}

module.exports = async function vueCliUpgrade (semverLevel = 'minor') {
  // get current deps
  // filter @vue/cli-service & @vue/cli-plugin-*
  const pkg = getPackageJson(projectPath)
  const upgradableDepMaps = new Map([
    ['dependencies', new Map()],
    ['devDependencies', new Map()],
    ['optionalDependencies', new Map()]
  ])

  logWithSpinner('Gathering update information...')
  for (const depType of upgradableDepMaps.keys()) {
    for (const [packageName, currRange] of Object.entries(pkg[depType] || {})) {
      if (!isCorePackage(packageName)) {
        continue
      }

      const upgradable = getUpgradableVersion(
        packageName,
        currRange,
        semverLevel
      )
      if (upgradable !== currRange) {
        upgradableDepMaps.get(depType).set(packageName, upgradable)
      }
    }
  }

  const table = new Table({
    head: ['package', 'installed', '', 'upgraded'],
    colAligns: ['left', 'right', 'right', 'right'],
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ''
    }
  })

  for (const [depType, depMap] of upgradableDepMaps.entries()) {
    for (const packageName of depMap.keys()) {
      const installedVersion = getInstalledVersion(packageName)
      const upgradedVersion = depMap.get(packageName)
      table.push([packageName, installedVersion, '→', upgradedVersion])

      pkg[depType][packageName] = upgradedVersion
    }
  }

  stopSpinner()

  if ([...upgradableDepMaps.values()].every(depMap => depMap.size === 0)) {
    console.log('Already up-to-date.')
    return
  }

  console.log('These packages can be upgraded:\n')
  console.log(table.toString())
  console.log(
    `\nView complete changelog at ${chalk.blue(
      'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
    )}\n`
  )

  const useYarn = shouldUseYarn()
  const { confirmed } = await inquirer.prompt([
    {
      name: 'confirmed',
      type: 'confirm',
      message: `Upgrade ${chalk.yellow('package.json')} and run ${chalk.blue(
        useYarn ? 'yarn install' : 'npm install'
      )}?`
    }
  ])

  if (!confirmed) {
    return
  }

  fs.writeFileSync(path.resolve(projectPath, 'package.json'), JSON.stringify(pkg, null, 2))
  console.log()
  console.log(`${chalk.yellow('package.json')} saved`)
  if (useYarn) {
    await installDeps(projectPath, 'yarn')
  } else {
    await installDeps(projectPath, 'npm')
  }
}
