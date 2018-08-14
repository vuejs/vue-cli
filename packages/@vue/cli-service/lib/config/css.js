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
    const getAssetPath = require('../util/getAssetPath')
    const shadowMode = !!process.env.VUE_CLI_CSS_SHADOW_MODE
    const isProd = process.env.NODE_ENV === 'production'

    const {
      modules = false,
      extract = isProd,
      sourceMap = false,
      loaderOptions = {}
    } = options.css || {}

    const shouldExtract = extract !== false && !shadowMode
    const filename = getAssetPath(
      options,
      `css/[name]${options.filenameHashing ? '.[contenthash:8]' : ''}.css`,
      true /* placeAtRootIfRelative */
    )
    const extractOptions = Object.assign({
      filename,
      chunkFilename: filename
    }, extract && typeof extract === 'object' ? extract : {})

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

    function createCSSRule (lang, test, loader, options) {
      const baseRule = webpackConfig.module.rule(lang).test(test)

      // rules for <style lang="module">
      const vueModulesRule = baseRule.oneOf('vue-modules').resourceQuery(/module/)
      applyLoaders(vueModulesRule, true)

      // rules for <style>
      const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/)
      applyLoaders(vueNormalRule, false)

      // rules for *.module.* files
      const extModulesRule = baseRule.oneOf('normal-modules').test(/\.module\.\w+$/)
      applyLoaders(extModulesRule, true)

      // rules for normal CSS imports
      const normalRule = baseRule.oneOf('normal')
      applyLoaders(normalRule, modules)

      function applyLoaders (rule, modules) {
        if (shouldExtract) {
          rule
            .use('extract-css-loader')
            .loader(require('mini-css-extract-plugin').loader)
        } else {
          rule
            .use('vue-style-loader')
            .loader('vue-style-loader')
            .options({
              sourceMap,
              shadowMode
            })
        }

        const cssLoaderOptions = Object.assign({
          sourceMap,
          importLoaders: (
            1 + // stylePostLoader injected by vue-loader
            hasPostCSSConfig
          )
        }, loaderOptions.css)

        if (modules) {
          const {
            localIdentName = '[name]_[local]_[hash:base64:5]'
          } = loaderOptions.css || {}
          Object.assign(cssLoaderOptions, {
            modules,
            localIdentName
          })
        }

        rule
          .use('css-loader')
          .loader('css-loader')
          .options(cssLoaderOptions)

        if (hasPostCSSConfig) {
          rule
            .use('postcss-loader')
            .loader('postcss-loader')
            .options(Object.assign({ sourceMap }, loaderOptions.postcss))
        }

        if (loader) {
          rule
            .use(loader)
            .loader(loader)
            .options(Object.assign({ sourceMap }, options))
        }
      }
    }

    createCSSRule('css', /\.css$/)
    createCSSRule('postcss', /\.p(ost)?css$/)
    createCSSRule('scss', /\.scss$/, 'sass-loader', loaderOptions.sass)
    createCSSRule('sass', /\.sass$/, 'sass-loader', Object.assign({
      indentedSyntax: true
    }, loaderOptions.sass))
    createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less)
    createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', Object.assign({
      preferPathResolver: 'webpack'
    }, loaderOptions.stylus))

    // inject CSS extraction plugin
    if (shouldExtract) {
      webpackConfig
        .plugin('extract-css')
          .use(require('mini-css-extract-plugin'), [extractOptions])
    }

    if (isProd) {
      // optimize CSS (dedupe)
      const cssProcessorOptions = {
        safe: true,
        autoprefixer: { disable: true },
        mergeLonghand: false
      }
      if (options.productionSourceMap && sourceMap) {
        cssProcessorOptions.map = { inline: false }
      }
      webpackConfig
        .plugin('optimize-css')
          .use(require('@intervolga/optimize-cssnano-plugin'), [{
            sourceMap: options.productionSourceMap && sourceMap,
            cssnanoOptions: cssProcessorOptions
          }])
    }
  })
}
