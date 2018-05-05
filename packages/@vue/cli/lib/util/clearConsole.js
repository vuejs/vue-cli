const chalk = require('chalk')
const semver = require('semver')
const getVersions = require('./getVersions')
const { clearConsole } = require('@vue/cli-shared-utils')

module.exports = async function clearConsoleWithTitle (checkUpdate) {
  const { current, latest } = await getVersions()

  let title = chalk.bold.blue(`Vue CLI v${current}`)

  if (process.env.VUE_CLI_TEST) {
    title += ' ' + chalk.blue.bold('TEST')
  }
  if (process.env.VUE_CLI_DEBUG) {
    title += ' ' + chalk.magenta.bold('DEBUG')
  }
  if (checkUpdate && semver.gt(latest, current)) {
    title += chalk.green(`
┌────────────────────${`─`.repeat(latest.length)}──┐
│  Update available: ${latest}  │
└────────────────────${`─`.repeat(latest.length)}──┘`)
  }

  clearConsole(title)
}
