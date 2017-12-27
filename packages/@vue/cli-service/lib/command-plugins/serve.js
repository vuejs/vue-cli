module.exports = (api, options) => {
  api.registerCommand('serve', (getWebpackConfig, args) => {
    process.env.NODE_ENV = args.prod ? 'production' : 'development'

    const webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const webpackConfig = getWebpackConfig()

    const compiler = webpack(webpackConfig)
    const server = new WebpackDevServer(compiler, Object.assign({
      clientLogLevel: 'warning',
      historyApiFallback: true,
      hot: true,
      compress: true,
      open: true,
      overlay: { warnings: false, errors: true },
      publicPath: '/',
      quiet: true
    }, options.devServer))

    server.listen(8080, '0.0.0.0')
  })
}
