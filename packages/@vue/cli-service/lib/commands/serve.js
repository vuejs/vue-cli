const chalk = require('chalk')

module.exports = (api, options) => {
  api.registerCommand('serve', {
    description: `start static server in ${chalk.cyan(options.outputDir)}`,
    usage: 'vue-cli-service serve [options]',
    details: `For all options, see ${
      chalk.cyan(`https://github.com/zeit/serve/blob/master/lib/options.js`)
    }`
  }, args => {
    const fs = require('fs')
    const serve = require('serve')
    const { error, hasYarn } = require('@vue/cli-shared-utils')

    const outputDir = api.resolve(options.outputDir)
    if (!fs.existsSync(outputDir)) {
      error(
        `Build directory ${chalk.gray(outputDir)} does not exist. ` +
        `Run ${chalk.cyan(hasYarn ? 'yarn build' : 'npm run build')} first.`
      )
      process.exit(1)
    }

    return serve(outputDir, Object.assign({}, args, {
      single: true
    }))
  })
}
