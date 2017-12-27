module.exports = (api, options) => {
  api.registerCommand('serve', args => {
    // TODO improve log formatting
    console.log('[vue-cli] starting dev server, hang tight...')

    api.setEnv(args.env || 'development')

    const chalk = require('chalk')
    const webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const portfinder = require('portfinder')
    const openBrowser = require('../util/openBrowser')
    const prepareURLs = require('../util/prepareURLs')
    const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

    const useHttps = args.https || options.https
    const host = args.host || process.env.HOST || options.host || '0.0.0.0'
    portfinder.basePort = args.port || process.env.PORT || options.port || 8080

    portfinder.getPort((err, port) => {
      if (err) {
        return console.error(err)
      }

      const webpackConfig = api.resolveWebpackConfig()
      const projectDevServerOptions = options.devServer || {}
      const urls = prepareURLs(
        useHttps ? 'https' : 'http',
        host,
        port
      )

      // inject friendly errors
      webpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [
            `App running at:`,
            `- Local:   ${urls.localUrlForTerminal}`,
            `- Network: ${urls.lanUrlForTerminal}`
          ],
          notes: [
            `Note that the development build is not optimized.`,
            `To create a production build, run ${chalk.cyan(`npm run build`)} or ${chalk.cyan(`yarn build`)}.`
          ]
        }
      }))

      // inject dev/hot client
      addDevClientToEntry(webpackConfig, [
        `webpack-dev-server/client/?${urls.localUrlForBrowser}`,
        projectDevServerOptions.hotOnly
          ? 'webpack/hot/dev-server'
          : 'webpack/hot/only-dev-server'
      ])

      const compiler = webpack(webpackConfig)
      const server = new WebpackDevServer(compiler, Object.assign({
        clientLogLevel: 'none',
        historyApiFallback: {
          disableDotRule: true
        },
        contentBase: api.resolve('public'),
        watchContentBase: true,
        https: useHttps,
        hot: true,
        quiet: true,
        compress: true,
        publicPath: webpackConfig.output.publicPath,
        // TODO use custom overlay w/ open-in-editor
        overlay: { warnings: false, errors: true },
        // TODO handle proxy
        proxy: {}
      }, projectDevServerOptions))

      server.listen(port, host, err => {
        if (err) {
          return console.error(err)
        }
        // TODO avoid duplicate opening
        // TODO avoid opening when compilation fails
        openBrowser(urls.localUrlForBrowser)
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
