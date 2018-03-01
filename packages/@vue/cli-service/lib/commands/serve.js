const {
  info,
  error,
  hasYarn,
  openBrowser
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
    usage: 'vue-cli-service serve [options]',
    options: {
      '--open': `open browser on server start`,
      '--mode': `specify env mode (default: ${defaults.mode})`,
      '--host': `specify host (default: ${defaults.host})`,
      '--port': `specify port (default: ${defaults.port})`,
      '--https': `use https (default: ${defaults.https})`
    }
  }, args => {
    info('Starting development server...')

    api.setMode(args.mode || defaults.mode)

    // although this is primarily a dev server, it is possible that we
    // are running it in a mode with a production env, e.g. in E2E tests.
    const isProduction = process.env.NODE_ENV === 'production'

    const chalk = require('chalk')
    const webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const portfinder = require('portfinder')
    const prepareURLs = require('../util/prepareURLs')
    const prepareProxy = require('../util/prepareProxy')
    const launchEditorMiddleware = require('launch-editor-middleware')

    const projectDevServerOptions = options.devServer || {}
    const useHttps = args.https || projectDevServerOptions.https || defaults.https
    const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host
    portfinder.basePort = args.port || process.env.PORT || projectDevServerOptions.port || defaults.port

    const portPromise = portfinder.getPortPromise()
    return portPromise.then(port => new Promise((resolve, reject) => {
      const webpackConfig = api.resolveWebpackConfig()

      const urls = prepareURLs(
        useHttps ? 'https' : 'http',
        host,
        port
      )

      if (!isProduction) {
        const devClients = [
          // dev server client
          require.resolve(`webpack-dev-server/client`),
          // hmr client
          require.resolve(projectDevServerOptions.hotOnly
            ? 'webpack/hot/only-dev-server'
            : 'webpack/hot/dev-server')
          // TODO custom overlay client
          // `@vue/cli-overlay/dist/client`
        ]
        if (process.env.APPVEYOR) {
          devClients.push(`webpack/hot/poll?500`)
        }
        // inject dev/hot client
        addDevClientToEntry(webpackConfig, devClients)
      }

      const compiler = webpack(webpackConfig)

      if (!process.env.VUE_CLI_TEST) {
        compiler.apply(new webpack.ProgressPlugin())
      }

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
            const buildCommand = hasYarn() ? `yarn build` : `npm run build`
            console.log(`  Note that the development build is not optimized.`)
            console.log(`  To create a production build, run ${chalk.cyan(buildCommand)}.`)
          } else {
            console.log(`  App is served in production mode.`)
            console.log(`  Note this is for preview or E2E testing only.`)
          }
          console.log()

          if (args.open || projectDevServerOptions.open) {
            openBrowser(urls.localUrlForBrowser)
          }

          // resolve returned Promise
          // so other commands can do api.service.run('serve').then(...)
          resolve({
            server,
            url: urls.localUrlForBrowser
          })
        } else if (process.env.VUE_CLI_TEST) {
          // signal for test to check HMR
          console.log('App updated')
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
        compress: isProduction,
        publicPath: '/',
        overlay: isProduction // TODO disable this
          ? false
          : { warnings: false, errors: true }
      }, projectDevServerOptions, {
        https: useHttps,
        proxy: proxySettings,
        before (app) {
          // launch editor support.
          // this works with vue-devtools & @vue/cli-overlay
          app.use('/__open-in-editor', launchEditorMiddleware(() => console.log(
            `To specify an editor, sepcify the EDITOR env variable or ` +
            `add "editor" field to your Vue project config.\n`
          )))
          // allow other plugins to register middlewares, e.g. PWA
          api.service.devServerConfigFns.forEach(fn => fn(app))
          // apply in project middlewares
          projectDevServerOptions.before && projectDevServerOptions.before(app)
        }
      }))

      ;['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
          server.close(() => {
            process.exit(0)
          })
        })
      })

      // on appveyor, killing the process with SIGTERM causes execa to
      // throw error
      if (process.env.VUE_CLI_TEST) {
        process.stdin.on('data', data => {
          if (data.toString() === 'close') {
            console.log('got close signal!')
            server.close(() => {
              process.exit(0)
            })
          }
        })
      }

      server.listen(port, host, err => {
        if (err) {
          return error(err)
        }
      })
    }))
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
