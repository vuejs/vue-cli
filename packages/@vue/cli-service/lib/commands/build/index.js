const defaults = {
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
      '--mode': `specify env mode (default: production)`,
      '--dest': `specify output directory (default: ${options.outputDir})`,
      '--target': `app | lib | wc | wc-async (default: ${defaults.target})`,
      '--name': `name for lib or web-component mode (default: "name" in package.json or entry filename)`
    }
  }, async function build (args) {
    args.entry = args.entry || args._[0]
    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }

    const fs = require('fs-extra')
    const path = require('path')
    const chalk = require('chalk')
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
    const mode = api.service.mode
    if (args.target === 'app') {
      logWithSpinner(`Building for ${mode}...`)
    } else {
      const buildMode = buildModes[args.target]
      if (buildMode) {
        logWithSpinner(`Building for ${mode} as ${buildMode}...`)
      } else {
        throw new Error(`Unknown build target: ${args.target}`)
      }
    }

    const targetDir = api.resolve(args.dest || options.outputDir)

    // respect inline build destination in copy plugin
    if (args.dest) {
      api.chainWebpack(config => {
        if (args.target === 'app') {
          config.plugin('copy').tap(args => {
            args[0][0].to = targetDir
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

    // apply inline dest path after user configureWebpack hooks
    // so it takes higher priority
    if (args.dest) {
      const applyDest = config => {
        config.output.path = targetDir
      }
      if (Array.isArray(webpackConfig)) {
        webpackConfig.forEach(applyDest)
      } else {
        applyDest(webpackConfig)
      }
    }

    // grab the actual output path and check for common mis-configuration
    const actualTargetDir = (
      Array.isArray(webpackConfig)
        ? webpackConfig[0]
        : webpackConfig
    ).output.path

    if (!args.dest && actualTargetDir !== api.resolve(options.outputDir)) {
      // user directly modifys output.path in configureWebpack or chainWebpack.
      // this is not supported because there's no way for us to give copy
      // plugin the correct value this way.
      console.error(chalk.red(
        `\n\nConfiguration Error: ` +
        `Avoid modifying webpack output.path directly. ` +
        `Use the "outputDir" option instead.\n`
      ))
      process.exit(1)
    }

    if (actualTargetDir === api.service.context) {
      console.error(chalk.red(
        `\n\nConfiguration Error: ` +
        `Do not set output directory to project root.\n`
      ))
      process.exit(1)
    }

    await fs.remove(targetDir)

    return new Promise((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        stopSpinner(false)
        if (err) {
          return reject(err)
        }

        if (stats.hasErrors()) {
          return reject(`Build failed with errors.`)
        }

        if (!args.silent) {
          const targetDirShort = path.relative(
            api.service.context,
            targetDir
          )
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
}

module.exports.defaultModes = {
  build: 'production'
}
