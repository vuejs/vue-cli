const chalk = require('chalk')
const semver = require('semver')
const getVersions = require('./getVersions')
const { clearConsole } = require('@vue/cli-shared-utils')

exports.generateTitle = async function (checkUpdate) {
  const { current, latest } = await getVersions()

  let title = chalk.bold.blue(`Vue CLI v${current['@vue/cli']}`)

  if (process.env.VUE_CLI_TEST) {
    title += ' ' + chalk.blue.bold('TEST')
  }
  if (process.env.VUE_CLI_DEBUG) {
    title += ' ' + chalk.magenta.bold('DEBUG')
  }
  if (checkUpdate && semver.gt(latest['@vue/cli'], current['@vue/cli'])) {
    if (process.env.VUE_CLI_API_MODE) {
      title += chalk.green(` 🌟️ Update available: ${latest}`)
    } else {
      title += chalk.green(`
┌────────────────────${`─`.repeat(latest['@vue/cli'].length)}──┐
│  Update available: ${latest['@vue/cli']}  │
└────────────────────${`─`.repeat(latest['@vue/cli'].length)}──┘`)
    }
  }

  return title
}

exports.clearConsole = async function clearConsoleWithTitle (checkUpdate) {
  const title = await exports.generateTitle(checkUpdate)
  clearConsole(title)
}
