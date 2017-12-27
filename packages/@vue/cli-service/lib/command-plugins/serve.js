module.exports = (api, options) => {
  api.registerCommand('serve', (getWebpackConfig, args) => {
    process.env.NODE_ENV = args.prod ? 'production' : 'development'

    // TODO use port-finder
    const port = options.port || 8080
    const host = options.host || '127.0.0.1'

    api.chainWebpack(config => {
      config
        .entry('app')
        .add(`webpack-dev-server/client/index.js?http://${host}:${port}`)
        .add(`webpack/hot/dev-server`)
    })

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

    server.listen(port, host)
  })
}
