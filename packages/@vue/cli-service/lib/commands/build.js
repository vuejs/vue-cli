// TODO handle alternative build targets

const defaults = {
  mode: 'production',
  target: 'app'
}

module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'vue-cli-service build [options]',
    options: {
      '--mode': `specify env mode (default: ${defaults.mode})`,
      '--target': `app | library | web-component (default: ${defaults.target})`
    }
  }, args => {
    api.setMode(args.mode || defaults.mode)

    const chalk = require('chalk')
    const rimraf = require('rimraf')
    const webpack = require('webpack')
    const {
      done,
      info,
      hasYarn,
      logWithSpinner,
      stopSpinner
    } = require('@vue/cli-shared-utils')

    console.log()
    logWithSpinner(`Building for production...`)

    return new Promise((resolve, reject) => {
      const targetDir = api.resolve(options.outputDir)
      rimraf(targetDir, err => {
        if (err) {
          return reject(err)
        }
        const webpackConfig = api.resolveWebpackConfig()
        webpack(webpackConfig, (err, stats) => {
          stopSpinner(false)
          if (err) {
            return reject(err)
          }
          process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            // TODO set this to true if using TS
            children: false,
            chunks: false,
            chunkModules: false
          }) + '\n\n')

          if (stats.hasErrors()) {
            return reject(`Build failed with errors.`)
          }

          done(`Build complete. The ${chalk.cyan(options.outputDir)} directory is ready to be deployed.\n`)
          const previewCommand = chalk.cyan(`${hasYarn ? 'yarn' : 'npm'} start`)
          info(`You can preview the production app by running ${previewCommand}.\n`)
          if (options.base === '/') {
            info(`The app is built assuming that it will be deployed at the root of a domain.`)
            info(`If you intend to deploy it under a subpath, update the ${chalk.green('base')} option`)
            info(`in your project config (${chalk.cyan(`vue.config.js`)} or ${chalk.green('"vue"')} field in ${chalk.cyan(`package.json`)}).\n`)
          }
        })
      })
    })
  })
}
