const { error } = require('@vue/cli-shared-utils')

const Upgrader = require('./Upgrader')

async function outdated (options, context = process.cwd()) {
  const upgrader = new Upgrader(context)
  return upgrader.checkForUpdates(options.next)
}

module.exports = (...args) => {
  return outdated(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
