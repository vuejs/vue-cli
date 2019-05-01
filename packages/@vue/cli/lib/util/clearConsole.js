const chalk = require('chalk')
const semver = require('semver')
const getVersions = require('./getVersions')
const { clearConsole } = require('@vue/cli-shared-utils')

exports.generateTitle = async function (checkUpdate) {
  const { current, latest } = await getVersions()

  let title = chalk.bold.blue(`Vue CLI v${current}`)

  if (process.env.VUE_CLI_TEST) {
    title += ' ' + chalk.blue.bold('TEST')
  }
  if (process.env.VUE_CLI_DEBUG) {
    title += ' ' + chalk.magenta.bold('DEBUG')
  }
  if (checkUpdate && semver.gt(latest, current)) {
    if (process.env.VUE_CLI_API_MODE) {
      title += chalk.green(` 🌟️ New version available: ${latest}`)
    } else {
      const upgradeMessage = `New version available ${chalk.magenta(current)} → ${chalk.green(latest)}\n` +
        `Run ${chalk.yellow(`npm i -g ${require('../../package.json').name}`)} to update!`
      const upgradeBox = require('boxen')(upgradeMessage, {
        align: 'center',
        borderColor: 'green',
        dimBorder: true,
        padding: 1
      })

      title += `\n${upgradeBox}\n`
    }
  }

  return title
}

exports.clearConsole = async function clearConsoleWithTitle (checkUpdate) {
  const title = await exports.generateTitle(checkUpdate)
  clearConsole(title)
}
