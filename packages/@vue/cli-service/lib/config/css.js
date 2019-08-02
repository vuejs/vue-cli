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

    const defaultSassLoaderOptions = {}
    try {
      defaultSassLoaderOptions.implementation = require('sass')
      defaultSassLoaderOptions.fiber = require('fibers')
    } catch (e) {}

    const {
      modules = false,
      extract = isProd,
      sourceMap = false,
      loaderOptions = {}
    } = options.css || {}

    const shouldExtract = extract !== false && !shadowMode
    const filename = getAssetPath(
      options,
      `css/[name]${options.filenameHashing ? '.[contenthash:8]' : ''}.css`
    )
    const extractOptions = Object.assign({
      filename,
      chunkFilename: filename
    }, extract && typeof extract === 'object' ? extract : {})

    // use relative publicPath in extracted CSS based on extract location
    const cssPublicPath = process.env.VUE_CLI_BUILD_TARGET === 'lib'
      // in lib mode, CSS is extracted to dist root.
      ? './'
      : '../'.repeat(
        extractOptions.filename
            .replace(/^\.[\/\\]/, '')
            .split(/[\/\\]/g)
            .length - 1
      )

    // check if the project has a valid postcss config
    // if it doesn't, don't use postcss-loader for direct style imports
    // because otherwise it would throw error when attempting to load postcss config
    const hasPostCSSConfig = !!(loaderOptions.postcss || api.service.pkg.postcss || findExisting(api.resolve('.'), [
      '.postcssrc',
      '.postcssrc.js',
      'postcss.config.js',
      '.postcssrc.yaml',
      '.postcssrc.json'
    ]))

    // if building for production but not extracting CSS, we need to minimize
    // the embbeded inline CSS as they will not be going through the optimizing
    // plugin.
    const needInlineMinification = isProd && !shouldExtract

    const cssnanoOptions = {
      preset: ['default', {
        mergeLonghand: false,
        cssDeclarationSorter: false
      }]
    }
    if (options.productionSourceMap && sourceMap) {
      cssnanoOptions.map = { inline: false }
    }

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
            .options({
              hmr: !isProd,
              publicPath: cssPublicPath
            })
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
            (hasPostCSSConfig ? 1 : 0) +
            (needInlineMinification ? 1 : 0)
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

        if (needInlineMinification) {
          rule
            .use('cssnano')
            .loader('postcss-loader')
            .options({
              sourceMap,
              plugins: [require('cssnano')(cssnanoOptions)]
            })
        }

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
    createCSSRule('scss', /\.scss$/, 'sass-loader', Object.assign(
      defaultSassLoaderOptions,
      loaderOptions.scss || loaderOptions.sass
    ))
    createCSSRule('sass', /\.sass$/, 'sass-loader', Object.assign(
      defaultSassLoaderOptions,
      {
        indentedSyntax: true
      },
      loaderOptions.sass
    ))
    createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less)
    createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', Object.assign({
      preferPathResolver: 'webpack'
    }, loaderOptions.stylus))

    // inject CSS extraction plugin
    if (shouldExtract) {
      webpackConfig
        .plugin('extract-css')
          .use(require('mini-css-extract-plugin'), [extractOptions])

      // minify extracted CSS
      if (isProd) {
        webpackConfig
          .plugin('optimize-css')
            .use(require('@intervolga/optimize-cssnano-plugin'), [{
              sourceMap: options.productionSourceMap && sourceMap,
              cssnanoOptions
            }])
      }
    }
  })
}
