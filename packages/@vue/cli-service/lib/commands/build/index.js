const defaults = {
  mode: 'production',
  target: 'app',
  entry: 'src/App.vue',
  keepAlive: false
}

module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'vue-cli-service build [options]',
    options: {
      '--mode': `specify env mode (default: ${defaults.mode})`,
      '--dest': `specify output directory (default: ${options.outputDir})`,
      '--target': `app | lib | web-component (default: ${defaults.target})`,
      '--entry': `entry for lib or web-component (default: ${defaults.entry})`,
      '--name': `name for lib or web-component (default: "name" in package.json or entry filename)`,
      '--keepAlive': `keep component alive when web-component is detached? (default: ${defaults.keepAlive})`
    }
  }, args => {
    for (const key in defaults) {
      if (args[key] == null) args[key] = defaults[key]
    }
    if (args.dest == null) {
      args.dest = options.outputDir
    }
    api.setMode(args.mode)

    const chalk = require('chalk')
    const rimraf = require('rimraf')
    const webpack = require('webpack')
    const {
      log,
      done,
      info,
      logWithSpinner,
      stopSpinner
    } = require('@vue/cli-shared-utils')

    log()
    if (args.target === 'app') {
      logWithSpinner(`Building for production...`)
    } else {
      logWithSpinner(`Building for production as ${args.target}...`)
    }

    return new Promise((resolve, reject) => {
      const targetDir = api.resolve(args.dest)
      rimraf(targetDir, err => {
        if (err) {
          return reject(err)
        }
        let webpackConfig
        if (args.target === 'lib') {
          webpackConfig = require('./resolveLibConfig')(api, args, options)
        } else if (args.target === 'web-component') {
          webpackConfig = require('./resolveWebComponentConfig')(api, args, options)
        } else {
          webpackConfig = api.resolveWebpackConfig()
        }
        webpack(webpackConfig, (err, stats) => {
          stopSpinner(false)
          if (err) {
            return reject(err)
          }

          if (!args.silent) {
            process.stdout.write(stats.toString({
              colors: true,
              modules: false,
              children: api.hasPlugin('typescript') || args.target !== 'app',
              chunks: false,
              chunkModules: false
            }) + '\n\n')
          }

          if (stats.hasErrors()) {
            return reject(`Build failed with errors.`)
          }

          if (!args.silent && args.target === 'app') {
            done(`Build complete. The ${chalk.cyan(options.outputDir)} directory is ready to be deployed.\n`)
            if (options.baseUrl === '/') {
              info(`The app is built assuming that it will be deployed at the root of a domain.`)
              info(`If you intend to deploy it under a subpath, update the ${chalk.green('base')} option`)
              info(`in your project config (${chalk.cyan(`vue.config.js`)} or ${chalk.green('"vue"')} field in ${chalk.cyan(`package.json`)}).\n`)
            }
            // TODO info(`You can view more deployment tips at ???`)
          }

          // test-only signal
          if (process.env.VUE_CLI_TEST) {
            console.log('Build complete.')
          }

          resolve()
        })
      })
    })
  })
}
