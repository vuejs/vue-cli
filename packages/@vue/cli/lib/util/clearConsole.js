const chalk = require('chalk')
const version = require('../../package.json').version
const { clearConsole } = require('@vue/cli-shared-utils')

let title = chalk.bold.green(`Vue CLI v${version}`)
if (process.env.VUE_CLI_DEBUG) {
  title += ' ' + chalk.magenta(' DEBUG MODE ')
}

module.exports = () => clearConsole(title)
