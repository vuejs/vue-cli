const defaults = {
  mode: 'production',
  target: 'app',
  entry: 'src/App.vue'
}

const buildModes = {
  lib: 'library (commonjs + umd)',
  wc: 'web component',
  'wc-async': 'web component (async)'
}

module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'vue-cli-service build [options] [entry|pattern]',
    options: {
      '--mode': `specify env mode (default: ${defaults.mode})`,
      '--dest': `specify output directory (default: ${options.outputDir})`,
      '--target': `app | lib | wc | wc-async (default: ${defaults.target})`,
      '--name': `name for lib or web-component mode (default: "name" in package.json or entry filename)`
    }
  }, args => {
    args.entry = args.entry || args._[0]
    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }

    api.setMode(args.mode)

    const fs = require('fs')
    const path = require('path')
    const chalk = require('chalk')
    const rimraf = require('rimraf')
    const webpack = require('webpack')
    const formatStats = require('./formatStats')
    const {
      log,
      done,
      info,
      logWithSpinner,
      stopSpinner
    } = require('@vue/cli-shared-utils')

    log()
    if (args.target === 'app') {
      logWithSpinner(`Building for ${args.mode}...`)
    } else {
      const buildMode = buildModes[args.target]
      if (buildMode) {
        logWithSpinner(`Building for ${args.mode} as ${buildMode}...`)
      } else {
        throw new Error(`Unknown build target: ${args.target}`)
      }
    }

    // respect inline build destination
    if (args.dest) {
      const dest = path.resolve(
        api.service.context,
        args.dest
      )
      api.chainWebpack(config => {
        config.output.path(dest)
        if (args.target === 'app') {
          config.plugin('copy').tap(args => {
            args[0][0].to = dest
            return args
          })
        }
      })
    }

    // resolve raw webpack config
    let webpackConfig
    if (args.target === 'lib') {
      webpackConfig = require('./resolveLibConfig')(api, args, options)
    } else if (
      args.target === 'wc' ||
      args.target === 'wc-async'
    ) {
      webpackConfig = require('./resolveWcConfig')(api, args, options)
    } else {
      webpackConfig = api.resolveWebpackConfig()
    }

    // get final output directory from resolve raw config
    // because the user may have manually overwritten it too
    const config = Array.isArray(webpackConfig)
      ? webpackConfig[0]
      : webpackConfig
    const targetDir = config.output.path
    const targetDirShort = path.relative(
      api.service.context,
      targetDir
    )

    return new Promise((resolve, reject) => {
      rimraf(targetDir, err => {
        if (err) {
          return reject(err)
        }

        webpack(webpackConfig, (err, stats) => {
          stopSpinner(false)
          if (err) {
            return reject(err)
          }

          if (stats.hasErrors()) {
            return reject(`Build failed with errors.`)
          }

          if (!args.silent) {
            log(formatStats(stats, targetDirShort, api))
            if (args.target === 'app') {
              done(`Build complete. The ${chalk.cyan(targetDirShort)} directory is ready to be deployed.\n`)
              if (
                options.baseUrl === '/' &&
                // only log the tips if this is the first build
                !fs.existsSync(api.resolve('node_modules/.cache'))
              ) {
                info(`The app is built assuming that it will be deployed at the root of a domain.`)
                info(`If you intend to deploy it under a subpath, update the ${chalk.green('baseUrl')} option`)
                info(`in your project config (${chalk.cyan(`vue.config.js`)} or ${chalk.green('"vue"')} field in ${chalk.cyan(`package.json`)}).\n`)
              }
            }
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
