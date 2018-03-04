module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const resolveLocal = require('../util/resolveLocal')
    const inlineLimit = 10000

    webpackConfig
      .context(api.service.context)
      .entry('app')
        .add('./src/main.js')
        .end()
      .output
        .path(api.resolve(options.outputDir))
        .filename('[name].js')
        .publicPath(options.baseUrl)

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

    webpackConfig.module
      .noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/)

    // js is handled by cli-plugin-bable

    webpackConfig.module
      .rule('vue')
        .test(/\.vue$/)
        .use('vue-loader')
          .loader('vue-loader')
          .options(Object.assign({}, options.vueLoader))

    webpackConfig.module
      .rule('images')
        .test(/\.(png|jpe?g|gif)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: inlineLimit,
            name: `img/[name].[hash:8].[ext]`
          })

    // do not base64-inline SVGs.
    // https://github.com/facebookincubator/create-react-app/pull/1180
    webpackConfig.module
      .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: `img/[name].[hash:8].[ext]`
          })

    webpackConfig.module
      .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: inlineLimit,
            name: `media/[name].[hash:8].[ext]`
          })

    webpackConfig.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: inlineLimit,
            name: `fonts/[name].[hash:8].[ext]`
          })

    webpackConfig.node
      .merge({
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // process is injected via DefinePlugin, although some 3rd party
        // libraries may require a mock to work properly (#934)
        process: 'mock',
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
      })

    const resolveClientEnv = require('../util/resolveClientEnv')
    webpackConfig
      .plugin('define')
        .use(require('webpack/lib/DefinePlugin'), [
          resolveClientEnv(options.baseUrl)
        ])

    webpackConfig
      .plugin('timefix')
        .use(require('../webpack/TimeFixPlugin'))

    webpackConfig
      .plugin('case-sensitive-paths')
        .use(require('case-sensitive-paths-webpack-plugin'))

    // friendly error plugin displays very confusing errors when webpack
    // fails to resolve a loader, so we provide custom handlers to improve it
    const { transformer, formatter } = require('../webpack/resolveLoaderError')
    webpackConfig
      .plugin('friendly-errors')
        .use(require('friendly-errors-webpack-plugin'), [{
          additionalTransformers: [transformer],
          additionalFormatters: [formatter]
        }])
  })
}
