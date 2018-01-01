const chalk = require('chalk')

module.exports = (api, options) => {
  api.registerCommand('serve', {
    description: `start static server in ${chalk.cyan(options.outputDir)}`,
    usage: 'vue-cli-service serve [options]',
    options: {
      '--mode': 'specify env mode for build (default: production)',
      '--https': 'use HTTPS? (default: false)'
    },
    details: `For additional options, see ${
      chalk.cyan(`https://github.com/zeit/serve/blob/master/lib/options.js`)
    }`
  }, args => {
    const mode = args.mode || 'production'
    api.setMode(mode)

    const fs = require('fs')
    const serve = require('serve')
    const chalk = require('chalk')
    const portfinder = require('portfinder')
    const prepareURLs = require('../util/prepareURLs')
    const { info, hasYarn } = require('@vue/cli-shared-utils')

    let buildPromise
    const outputDir = api.resolve(options.outputDir)
    if (!fs.existsSync(outputDir)) {
      info(
        `Build directory does not exist. ` +
        `Running ${chalk.cyan(hasYarn ? 'yarn build' : 'npm run build')} first.`
      )
      buildPromise = api.service.run('build', {
        mode,
        silent: true
      })
    } else {
      buildPromise = Promise.resolve()
    }

    buildPromise.then(() => {
      portfinder.basePort = args.port || 3000
      return portfinder.getPortPromise()
    }).then(port => {
      const serveOptions = Object.assign({}, args, {
        port,
        ssl: args.https,
        silent: true,
        single: true,
        treeless: true
      })
      delete serveOptions.mode
      delete serveOptions.https

      serve(outputDir, serveOptions)

      const urls = prepareURLs(args.https ? 'https' : 'http', '::', port)
      console.log()
      console.log([
        `  Serving static app in ${chalk.yellow(mode)} mode at:\n`,
        `  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`,
        `  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`
      ].join('\n'))
      console.log()
    })
  })
}
