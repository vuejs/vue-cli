// config that are specific to --target app
const fs = require('fs')
const path = require('path')

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    // only apply when there's no alternative target
    if (process.env.VUE_CLI_TARGET) {
      return
    }

    const isProd = process.env.NODE_ENV === 'production'

    // HTML plugin
    const resolveClientEnv = require('../util/resolveClientEnv')
    const htmlPath = api.resolve('public/index.html')
    const htmlOptions = {
      // use default index.html
      template: fs.existsSync(htmlPath)
        ? htmlPath
        : path.resolve(__dirname, 'index-default.html'),
      templateParameters: (compilation, assets, pluginOptions) => {
        // enhance html-webpack-plugin's built in template params
        let stats
        return Object.assign({
          // make stats lazy as it is expensive
          get webpack () {
            return stats || (stats = compilation.getStats().toJson())
          },
          compilation: compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: pluginOptions
          }
        }, resolveClientEnv(options.baseUrl, true /* raw */))
      }
    }

    if (isProd) {
      Object.assign(htmlOptions, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      })
    }

    webpackConfig
      .plugin('html')
        .use(require('html-webpack-plugin'), [htmlOptions])

    // inject preload/prefetch to HTML
    const PreloadPlugin = require('preload-webpack-plugin')
    webpackConfig
      .plugin('preload')
        .use(PreloadPlugin, [{
          rel: 'preload',
          include: 'initial',
          fileBlacklist: [/\.map$/, /hot-update\.js$/]
        }])

    webpackConfig
      .plugin('prefetch')
        .use(PreloadPlugin, [{
          rel: 'prefetch',
          include: 'asyncChunks'
        }])

    // copy static assets in public/
    if (fs.existsSync(api.resolve('public'))) {
      webpackConfig
        .plugin('copy')
          .use(require('copy-webpack-plugin'), [[{
            from: api.resolve('public'),
            to: api.resolve(options.outputDir),
            ignore: ['index.html', '.DS_Store']
          }]])
    }

    // code splitting
    if (isProd) {
      webpackConfig
        .optimization.splitChunks({
          chunks: 'all'
        })
    }
  })
}
