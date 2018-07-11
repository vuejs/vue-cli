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
      title += chalk.green(` 🌟️ Update available: ${latest}`)
    } else {
      title += chalk.green(`
┌────────────────────${`─`.repeat(latest.length)}──┐
│  Update available: ${latest}  │
└────────────────────${`─`.repeat(latest.length)}──┘`)
    }
  }

  return title
}

exports.clearConsole = async function clearConsoleWithTitle (checkUpdate) {
  const title = await exports.generateTitle(checkUpdate)
  clearConsole(title)
}
