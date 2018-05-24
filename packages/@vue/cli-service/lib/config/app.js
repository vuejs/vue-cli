// config that are specific to --target app

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    // only apply when there's no alternative target
    if (process.env.VUE_CLI_TARGET) {
      return
    }

    // HTML plugin
    const resolveClientEnv = require('../util/resolveClientEnv')
    const htmlOptions = {
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
    // only set template path if index.html exists
    const htmlPath = api.resolve('public/index.html')
    if (require('fs').existsSync(htmlPath)) {
      htmlOptions.template = htmlPath
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
    webpackConfig
      .plugin('copy')
        .use(require('copy-webpack-plugin'), [[{
          from: api.resolve('public'),
          to: api.resolve(options.outputDir),
          ignore: ['index.html', '.DS_Store']
        }]])

    if (process.env.NODE_ENV === 'production') {
      // minify HTML
      webpackConfig
        .plugin('html')
          .tap(([options]) => [Object.assign(options, {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true
              // more options:
              // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
          })])

      // code splitting
      webpackConfig
        .optimization.splitChunks({
          chunks: 'all'
        })
    }
  })
}
