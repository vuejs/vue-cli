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
        }, resolveClientEnv(options, true /* raw */))
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

    // resolve HTML file(s)
    const HTMLPlugin = require('html-webpack-plugin')
    const PreloadPlugin = require('@vue/preload-webpack-plugin')
    const multiPageConfig = options.pages
    const htmlPath = api.resolve('public/index.html')
    const defaultHtmlPath = path.resolve(__dirname, 'index-default.html')

    if (!multiPageConfig) {
      // default, single page setup.
      htmlOptions.template = fs.existsSync(htmlPath)
        ? htmlPath
        : defaultHtmlPath

      webpackConfig
        .plugin('html')
          .use(HTMLPlugin, [htmlOptions])

      // inject preload/prefetch to HTML
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
    } else {
      // multi-page setup
      webpackConfig.entryPoints.clear()

      const pages = Object.keys(multiPageConfig)

      pages.forEach(name => {
        const {
          entry,
          template = `public/${name}.html`,
          filename = `${name}.html`
        } = multiPageConfig[name]
        // inject entry
        webpackConfig.entry(name).add(api.resolve(entry))

        // inject html plugin for the page
        const pageHtmlOptions = Object.assign({}, htmlOptions, {
          chunks: ['chunk-vendors', 'chunk-common', name],
          template: fs.existsSync(template) ? template : defaultHtmlPath,
          filename
        })

        webpackConfig
          .plugin(`html-${name}`)
            .use(HTMLPlugin, [pageHtmlOptions])
      })

      pages.forEach(name => {
        const { filename = `${name}.html` } = multiPageConfig[name]
        webpackConfig
          .plugin(`preload-${name}`)
            .use(PreloadPlugin, [{
              rel: 'preload',
              includeHtmlNames: [filename],
              include: {
                type: 'initial',
                entries: [name]
              },
              fileBlacklist: [/\.map$/, /hot-update\.js$/]
            }])

        webpackConfig
          .plugin(`prefetch-${name}`)
            .use(PreloadPlugin, [{
              rel: 'prefetch',
              includeHtmlNames: [filename],
              include: {
                type: 'asyncChunks',
                entries: [name]
              }
            }])
      })
    }

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
          chunks: 'all',
          name: (m, chunks, cacheGroup) => `chunk-${cacheGroup}`,
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10
            },
            common: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        })
    }
  })
}
