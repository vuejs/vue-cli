const getVersions = require('./getVersions')
const {
  chalk,
  execa,
  semver,

  clearConsole,

  hasYarn,
  hasPnpm3OrLater
} = require('@vue/cli-shared-utils')

async function getInstallationCommand () {
  if (hasYarn()) {
    const { stdout: yarnGlobalDir } = await execa('yarn', ['global', 'dir'])
    if (__dirname.includes(yarnGlobalDir)) {
      return 'yarn global add'
    }
  }

  if (hasPnpm3OrLater()) {
    const { stdout: pnpmGlobalPrefix } = await execa('pnpm', ['config', 'get', 'prefix'])
    if (__dirname.includes(pnpmGlobalPrefix) && __dirname.includes('pnpm-global')) {
      return `pnpm i -g`
    }
  }

  const { stdout: npmGlobalPrefix } = await execa('npm', ['config', 'get', 'prefix'])
  if (__dirname.includes(npmGlobalPrefix)) {
    return `npm i -g`
  }
}

exports.generateTitle = async function (checkUpdate) {
  const { current, latest, error } = await getVersions()
  let title = chalk.bold.blue(`Vue CLI v${current}`)

  if (process.env.VUE_CLI_TEST) {
    title += ' ' + chalk.blue.bold('TEST')
  }
  if (process.env.VUE_CLI_DEBUG) {
    title += ' ' + chalk.magenta.bold('DEBUG')
  }

  if (error) {
    title += '\n' + chalk.red('Failed to check for updates')
  }

  if (checkUpdate && !error && semver.gt(latest, current)) {
    if (process.env.VUE_CLI_API_MODE) {
      title += chalk.green(` 🌟️ New version available: ${latest}`)
    } else {
      let upgradeMessage = `New version available ${chalk.magenta(current)} → ${chalk.green(latest)}`

      try {
        const command = await getInstallationCommand()
        let name = require('../../package.json').name
        if (semver.prerelease(latest)) {
          name += '@next'
        }

        if (command) {
          upgradeMessage +=
            `\nRun ${chalk.yellow(`${command} ${name}`)} to update!`
        }
      } catch (e) {}

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
