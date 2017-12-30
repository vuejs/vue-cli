module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const webpack = require('webpack')
    const resolveLocal = require('../util/resolveLocal')
    const resolveClientEnv = require('../util/resolveClientEnv')
    const HTMLPlugin = require('html-webpack-plugin')
    const TimeFixPlugin = require('../util/TimeFixPlugin')
    const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')

    webpackConfig
      .context(api.service.context)
      .entry('app')
        .add('./src/main.js')
        .end()
      .output
        .path(api.resolve(options.outputDir))
        .filename('[name].js')
        .publicPath(options.base)

    webpackConfig.resolve
      .set('symlinks', true)
      .extensions
        .merge(['.js', '.jsx', '.vue', '.json'])
        .end()
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))
        .add(resolveLocal('node_modules'))
        .end()
      .alias
        .set('@', api.resolve('src'))
        .set('vue$', options.compiler ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.runtime.esm.js')

    webpackConfig.resolveLoader
      .set('symlinks', true)
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))
        .add(resolveLocal('node_modules'))

    // js is handled by cli-plugin-bable

    webpackConfig.module
      .rule('vue')
        .test(/\.vue$/)
        .use('vue-loader')
          .loader('vue-loader')
          .options(Object.assign({}, options.vueLoaderOptions))

    webpackConfig.module
      .rule('images')
        .test(/\.(png|jpe?g|gif)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 10000,
            name: `${options.staticDir}/img/[name].[hash:8].[ext]`
          })

    // do not base64-inline SVGs.
    // https://github.com/facebookincubator/create-react-app/pull/1180
    webpackConfig.module
      .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: `${options.staticDir}/img/[name].[hash:8].[ext]`
          })

    webpackConfig.module
      .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 10000,
            name: `${options.staticDir}/media/[name].[hash:8].[ext]`
          })

    webpackConfig.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 10000,
            name: `${options.staticDir}/fonts/[name].[hash:8].[ext]`
          })

    webpackConfig.node
      .merge({
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
      })

    // TODO handle publicPath in template
    webpackConfig
      .plugin('html')
        .use(HTMLPlugin, [{
          template: api.resolve('public/index.html')
        }])

    webpackConfig
      .plugin('define')
        .use(webpack.DefinePlugin, [resolveClientEnv()])

    webpackConfig
      .plugin('timefix')
        .use(TimeFixPlugin)

    webpackConfig
      .plugin('case-sensitive-paths')
        .use(CaseSensitivePathsPlugin)
  })
}
