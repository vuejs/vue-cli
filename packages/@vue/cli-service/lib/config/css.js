module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const CSSLoaderResolver = require('../util/CSSLoaderResolver')
    const ExtractTextPlugin = require('extract-text-webpack-plugin')

    const isProd = process.env.NODE_ENV === 'production'
    const extract = isProd && options.extractCSS !== false
    const resolver = new CSSLoaderResolver({
      sourceMap: !!options.cssSourceMap,
      cssModules: !!options.cssModules,
      minimize: isProd,
      extract
    })

    // apply css loaders for vue-loader
    webpackConfig.module
      .rule('vue')
        .use('vue-loader')
        .tap(options => {
          // ensure user injected vueLoaderOptions take higher priority
          options.loaders = Object.assign(resolver.vue(), options.loaders)
        })

    // apply css loaders for standalone style files outside vue-loader
    const langs = ['css', 'stylus', 'styl', 'sass', 'scss', 'less']
    for (const lang of langs) {
      const rule = resolver[lang]()
      const context = webpackConfig.module
        .rule(lang)
        .test(rule.test)
        .include
          .add(filepath => {
            // Not ends with `.module.xxx`
            return !/\.module\.[a-z]+$/.test(filepath)
          })
          .end()

      rule.use.forEach(use => {
        context
          .use(use.loader)
            .loader(use.loader)
            .options(use.options)
      })
    }

    // handle cssModules for *.module.js
    resolver.set('cssModules', true)

    const cssModulesLangs = langs.map(lang => [lang, new RegExp(`\\.module\\.${lang}`)])
    for (const cssModulesLang of cssModulesLangs) {
      const [lang, test] = cssModulesLang
      const rule = resolver[lang](test)
      const context = webpackConfig.module
        .rule(`${lang}-module`)
        .test(rule.test)

      rule.use.forEach(use => {
        context
          .use(use.loader)
            .loader(use.loader)
            .options(use.options)
      })
    }

    // inject CSS extraction plugin
    if (extract) {
      const userOptions = options.extractCSS && typeof options.extractCSS === 'object'
        ? options.extractCSS
        : {}
      webpackConfig
        .plugin('extract-css')
          .use(ExtractTextPlugin, [Object.assign({
            filename: '[name].[contenthash:8].css',
            allChunks: true
          }, userOptions)])
    }

    // TODO document receipe for adding sass-resource-loader
  })
}
