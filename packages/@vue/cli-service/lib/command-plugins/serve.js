module.exports = (api, options) => {
  api.registerCommand('serve', {
    description: 'start development server',
    usage: 'vue-cli-service serve',
    options: {
      '--open': 'open browser on server start',
      '--env': 'specify NODE_ENV (default: development)',
      '--host': 'specify host (default: 0.0.0.0)',
      '--port': 'specify port (default: 8080)',
      '--https': 'use https'
    }
  }, args => {
    console.log('Starting dev server, hang tight...')

    api.setEnv(args.env || 'development')

    const chalk = require('chalk')
    const webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const portfinder = require('portfinder')
    const openBrowser = require('../util/openBrowser')
    const prepareURLs = require('../util/prepareURLs')
    const prepareProxy = require('../util/prepareProxy')
    const overlayMiddleware = require('@vue/cli-overlay/middleware')

    const projectDevServerOptions = options.devServer || {}
    const useHttps = args.https || projectDevServerOptions.https
    const host = args.host || process.env.HOST || projectDevServerOptions.host || '0.0.0.0'
    portfinder.basePort = args.port || process.env.PORT || projectDevServerOptions.port || 8080

    portfinder.getPort((err, port) => {
      if (err) {
        return console.error(err)
      }

      const webpackConfig = api.resolveWebpackConfig()

      const urls = prepareURLs(
        useHttps ? 'https' : 'http',
        host,
        port
      )

      // inject dev/hot client
      addDevClientToEntry(webpackConfig, [
        // dev server client
        `webpack-dev-server/client/?${urls.localUrlForBrowser}`,
        // hmr client
        projectDevServerOptions.hotOnly
          ? 'webpack/hot/dev-server'
          : 'webpack/hot/only-dev-server',
        // custom overlay client
        `@vue/cli-overlay/dist/client`
      ])

      const compiler = webpack(webpackConfig)

      // log instructions & open browser on first compilation complete
      let isFirstCompile = true
      compiler.plugin('done', stats => {
        if (stats.hasErrors()) {
          return
        }

        console.log([
          `  App running at:`,
          `  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`,
          `  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`
        ].join('\n'))
        console.log()

        if (isFirstCompile) {
          isFirstCompile = false
          console.log([
            `  Note that the development build is not optimized.`,
            `  To create a production build, run ${chalk.cyan(`npm run build`)} or ${chalk.cyan(`yarn build`)}.`
          ].join('\n'))
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
        watchContentBase: true,
        hot: true,
        quiet: true,
        compress: true,
        publicPath: webpackConfig.output.publicPath
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
          return console.error(err)
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
