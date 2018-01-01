const {
  info,
  error,
  hasYarn,
  clearConsole
} = require('@vue/cli-shared-utils')

const defaults = {
  mode: 'development',
  host: '0.0.0.0',
  port: 8080,
  https: false
}

module.exports = (api, options) => {
  api.registerCommand('serve', {
    description: 'start development server',
    usage: 'vue-cli-service dev [options]',
    options: {
      '--open': `open browser on server start`,
      '--mode': `specify env mode (default: ${defaults.mode})`,
      '--host': `specify host (default: ${defaults.host})`,
      '--port': `specify port (default: ${defaults.port})`,
      '--https': `use https (default: ${defaults.https})`
    }
  }, args => {
    clearConsole()
    info('Starting development server...')

    api.setMode(args.mode || defaults.mode)

    // although this is primarily a dev server, it is possible that we
    // are running it in a mode with a production env, e.g. in E2E tests.
    const isProduction = process.env.NODE_ENV === 'production'

    const chalk = require('chalk')
    const webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const portfinder = require('portfinder')
    const openBrowser = require('../util/openBrowser')
    const prepareURLs = require('../util/prepareURLs')
    const prepareProxy = require('../util/prepareProxy')
    const overlayMiddleware = require('@vue/cli-overlay/middleware')

    const projectDevServerOptions = options.devServer || {}
    const useHttps = args.https || projectDevServerOptions.https || defaults.https
    const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host
    portfinder.basePort = args.port || process.env.PORT || projectDevServerOptions.port || defaults.port

    portfinder.getPort((err, port) => {
      if (err) {
        return error(err)
      }

      const webpackConfig = api.resolveWebpackConfig()

      const urls = prepareURLs(
        useHttps ? 'https' : 'http',
        host,
        port
      )

      if (!isProduction) {
        // inject dev/hot client
        addDevClientToEntry(webpackConfig, [
          // dev server client
          `webpack-dev-server/client/?${urls.localUrlForBrowser}`,
          // hmr client
          projectDevServerOptions.hotOnly
            ? 'webpack/hot/dev-server'
            : 'webpack/hot/only-dev-server'
          // TODO custom overlay client
          // `@vue/cli-overlay/dist/client`
        ])
      }

      const compiler = webpack(webpackConfig)

      // log instructions & open browser on first compilation complete
      let isFirstCompile = true
      compiler.plugin('done', stats => {
        if (stats.hasErrors()) {
          return
        }

        console.log()
        console.log([
          `  App running at:`,
          `  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`,
          `  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`
        ].join('\n'))
        console.log()

        if (isFirstCompile) {
          isFirstCompile = false

          if (!isProduction) {
            const buildCommand = hasYarn ? `yarn build` : `npm run build`
            console.log(`  Note that the development build is not optimized.`)
            console.log(`  To create a production build, run ${chalk.cyan(buildCommand)}.`)
          } else {
            console.log(`  App is served in production mode.`)
            console.log(`  Note this is for preview or E2E testing only.`)
            // TODO console.log(`  See URL for more deployment tips.`)
          }
          console.log()

          if (args.open || projectDevServerOptions.open) {
            openBrowser(urls.localUrlForBrowser)
          }
        }
      })

      const proxySettings = prepareProxy(
        projectDevServerOptions.proxy,
        api.resolve('public')
      )

      const server = new WebpackDevServer(compiler, Object.assign({
        clientLogLevel: 'none',
        historyApiFallback: {
          disableDotRule: true
        },
        contentBase: api.resolve('public'),
        watchContentBase: !isProduction,
        hot: !isProduction,
        quiet: true,
        compress: true,
        publicPath: '/',
        overlay: isProduction // TODO disable this
          ? false
          : { warnings: false, errors: true }
      }, projectDevServerOptions, {
        https: useHttps,
        proxy: proxySettings,
        before (app) {
          // overlay
          app.use(overlayMiddleware())
          // allow other plugins to register middlewares, e.g. PWA
          api.service.devServerConfigFns.forEach(fn => fn(app))
          // apply in project middlewares
          projectDevServerOptions.before && projectDevServerOptions.before(app)
        }
      }))

      server.listen(port, host, err => {
        if (err) {
          return error(err)
        }
      })
    })
  })
}

function addDevClientToEntry (config, devClient) {
  const { entry } = config
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    Object.keys(entry).forEach((key) => {
      entry[key] = devClient.concat(entry[key])
    })
  } else if (typeof entry === 'function') {
    config.entry = entry(devClient)
  } else {
    config.entry = devClient.concat(entry)
  }
}
