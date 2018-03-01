const fs = require('fs')
const path = require('path')

const findExisting = (context, files) => {
  for (const file of files) {
    if (fs.existsSync(path.join(context, file))) {
      return file
    }
  }
}

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const CSSLoaderResolver = require('../webpack/CSSLoaderResolver')
    const ExtractTextPlugin = require('extract-text-webpack-plugin')

    const isProd = process.env.NODE_ENV === 'production'
    const defaultOptions = {
      extract: true,
      modules: false,
      sourceMap: false,
      loaderOptions: {},
      localIdentName: '[name]_[local]__[hash:base64:5]'
    }
    const userOptions = Object.assign(defaultOptions, options.css || {})
    const extract = isProd && userOptions.extract !== false

    // check if the project has a valid postcss config
    // if it doesn't, don't use postcss-loader for direct style imports
    // because otherwise it would throw error when attempting to load postcss config
    const hasPostCSSConfig = !!(api.service.pkg.postcss || findExisting(api.resolve('.'), [
      '.postcssrc',
      '.postcssrc.js',
      'postcss.config.js',
      '.postcssrc.yaml',
      '.postcssrc.json'
    ]))

    const baseOptions = Object.assign({}, userOptions, {
      extract,
      minimize: isProd,
      postcss: hasPostCSSConfig
    })

    const resolver = new CSSLoaderResolver(baseOptions)

    // apply css loaders for vue-loader
    webpackConfig.module
      .rule('vue')
        .use('vue-loader')
        .tap(options => {
          // ensure user injected vueLoader options take higher priority
          options.loaders = Object.assign(resolver.vue(), options.loaders)
          options.cssSourceMap = !!userOptions.cssSourceMap
          options.cssModules = Object.assign({
            localIdentName: baseOptions.localIdentName
          }, options.cssModules)
          return options
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
    const cssModulesResolver = new CSSLoaderResolver(Object.assign({}, baseOptions, {
      modules: true
    }))

    const cssModulesLangs = langs.map(lang => [lang, new RegExp(`\\.module\\.${lang}$`)])
    for (const cssModulesLang of cssModulesLangs) {
      const [lang, test] = cssModulesLang
      const rule = cssModulesResolver[lang](test)
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
            filename: `css/[name].[contenthash:8].css`,
            allChunks: true
          }, userOptions)])
    }

    // TODO document receipe for using css.loaderOptions to add `data` option
    // to sass-loader
  })
}
