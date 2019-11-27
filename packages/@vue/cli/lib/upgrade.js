const inquirer = require('inquirer')
const { error } = require('@vue/cli-shared-utils')

const Upgrader = require('./Upgrader')
const confirmIfGitDirty = require('./util/confirmIfGitDirty')

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
      return upgrader.upgradeAll(options.next)
    }

    const upgradable = await upgrader.checkForUpdates(options.next)
    if (upgradable) {
      const { ok } = await inquirer.prompt([
        {
          name: 'ok',
          type: 'confirm',
          message: 'Continue to upgrade these plugins?',
          default: true
        }
      ])

      if (ok) {
        return upgrader.upgradeAll(options.next)
      }
    }

    return
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
