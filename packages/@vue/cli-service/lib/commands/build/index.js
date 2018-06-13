const defaults = {
  clean: true,
  target: 'app'
}

const buildModes = {
  lib: 'library (commonjs + umd)',
  wc: 'web component',
  'wc-async': 'web component (async)'
}

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach(c => fn(c))
  } else {
    fn(config)
  }
}

module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'vue-cli-service build [options] [entry|pattern]',
    options: {
      '--mode': `specify env mode (default: production)`,
      '--dest': `specify output directory (default: ${options.outputDir})`,
      '--modern': `build app targeting modern browsers with auto fallback`,
      '--target': `app | lib | wc | wc-async (default: ${defaults.target})`,
      '--name': `name for lib or web-component mode (default: "name" in package.json or entry filename)`,
      '--no-clean': `do not remove the dist directory before building the project`,
      '--report': `generate report.html to help analyze bundle content`,
      '--report-json': 'generate report.json to help analyze bundle content',
      '--watch': `watch for changes`
    }
  }, async (args) => {
    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }
    args.entry = args.entry || args._[0]
    if (args.target !== 'app') {
      args.entry = args.entry || 'src/App.vue'
    }

    process.env.VUE_CLI_BUILD_TARGET = args.target
    if (args.modern && args.target === 'app') {
      process.env.VUE_CLI_MODERN_MODE = true
      delete process.env.VUE_CLI_MODERN_BUILD
      await build(Object.assign({}, args, {
        modernBuild: false
      }), api, options)

      process.env.VUE_CLI_MODERN_BUILD = true
      await build(Object.assign({}, args, {
        modernBuild: true,
        clean: false
      }), api, options)

      delete process.env.VUE_CLI_MODERN_MODE
      delete process.env.VUE_CLI_MODERN_BUILD
    } else {
      await build(args, api, options)
    }
    delete process.env.VUE_CLI_BUILD_TARGET
  })
}

async function build (args, api, options) {
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
    const bundleTag = args.modern
      ? args.modernBuild
        ? `modern bundle `
        : `legacy bundle `
      : ``
    logWithSpinner(`Building ${bundleTag}for ${mode}...`)
  } else {
    const buildMode = buildModes[args.target]
    if (buildMode) {
      logWithSpinner(`Building for ${mode} as ${buildMode}...`)
    } else {
      throw new Error(`Unknown build target: ${args.target}`)
    }
  }

  const targetDir = api.resolve(args.dest || options.outputDir)
  const isLegacyBuild = args.target === 'app' && args.modern && !args.modernBuild

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
    webpackConfig = require('./resolveAppConfig')(api, args, options)
  }

  // apply inline dest path after user configureWebpack hooks
  // so it takes higher priority
  if (args.dest) {
    modifyConfig(webpackConfig, config => {
      config.output.path = targetDir
    })
  }

  // grab the actual output path and check for common mis-configuration
  const actualTargetDir = (
    Array.isArray(webpackConfig)
      ? webpackConfig[0]
      : webpackConfig
  ).output.path

  if (!args.dest && actualTargetDir !== api.resolve(options.outputDir)) {
    // user directly modifies output.path in configureWebpack or chainWebpack.
    // this is not supported because there's no way for us to give copy
    // plugin the correct value this way.
    throw new Error(
      `\n\nConfiguration Error: ` +
      `Avoid modifying webpack output.path directly. ` +
      `Use the "outputDir" option instead.\n`
    )
  }

  if (actualTargetDir === api.service.context) {
    throw new Error(
      `\n\nConfiguration Error: ` +
      `Do not set output directory to project root.\n`
    )
  }

  if (args.watch) {
    modifyConfig(webpackConfig, config => {
      config.watch = true
    })
  }

  // Expose advanced stats
  if (args.dashboard) {
    const DashboardPlugin = require('../../webpack/DashboardPlugin')
    modifyConfig(webpackConfig, config => {
      config.plugins.push(new DashboardPlugin({
        type: 'build'
      }))
    })
  }

  if (args.report || args['report-json']) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    modifyConfig(webpackConfig, config => {
      const bundleName = args.target !== 'app'
        ? config.output.filename.replace(/\.js$/, '-')
        : isLegacyBuild ? 'legacy-' : ''
      config.plugins.push(new BundleAnalyzerPlugin({
        logLevel: 'warn',
        openAnalyzer: false,
        analyzerMode: args.report ? 'static' : 'disabled',
        reportFilename: `${bundleName}report.html`,
        statsFilename: `${bundleName}report.json`,
        generateStatsFile: !!args['report-json']
      }))
    })
  }

  if (args.clean) {
    await fs.remove(targetDir)
  }

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
        if (args.target === 'app' && !isLegacyBuild) {
          if (!args.watch) {
            done(`Build complete. The ${chalk.cyan(targetDirShort)} directory is ready to be deployed.\n`)
          } else {
            done(`Build complete. Watching for changes...`)
          }
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
}

module.exports.defaultModes = {
  build: 'production'
}
