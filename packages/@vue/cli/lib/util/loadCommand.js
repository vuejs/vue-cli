module.exports = function loadCommand (name) {
  const moduleName = `@vue/cli-${name}`
  const isNotFoundError = err => {
    return err.message.match(/Cannot find module/)
  }
  try {
    require(moduleName)
  } catch (err) {
    if (isNotFoundError(err)) {
      try {
        require('import-global')(`@vue/cli-${name}`)
      } catch (err2) {
        if (isNotFoundError(err2)) {
          const chalk = require('chalk')
          const { hasYarn } = require('@vue/cli-shared-utils')
          const installCommand = hasYarn ? `yarn global add` : `npm install -g`
          console.log()
          console.log(
            `  Command ${chalk.cyan(`vue ${name}`)} requires a global addon to be installed.\n` +
            `  Please run ${chalk.cyan(`${installCommand} ${moduleName}`)} and try again.`
          )
          console.log()
        } else {
          throw err2
        }
      }
    } else {
      throw err
    }
  }
}
