const chalk = require('chalk')
const version = require('../../package.json').version
const { clearConsole } = require('@vue/cli-shared-utils')

let title = chalk.bold.green(`Vue CLI v${version}`)
if (process.env.VUE_CLI_TEST) {
  title += ' ' + chalk.magenta.bold('TEST MODE')
}

module.exports = () => clearConsole(title)
