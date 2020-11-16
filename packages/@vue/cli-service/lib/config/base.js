const getVersions = require('../util/getVersions')

module.exports = (api, options) => {
  const { vueMajor, webpackMajor } = getVersions(api.getCwd())

  api.chainWebpack(webpackConfig => {
    const isLegacyBundle = process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD
    const resolveLocal = require('../util/resolveLocal')

    webpackConfig
      .mode('development')
      .context(api.service.context)
      .entry('app')
        .add('./src/main.js')
        .end()
      .output
        .path(api.resolve(options.outputDir))
        .filename(isLegacyBundle ? '[name]-legacy.js' : '[name].js')
        .publicPath(options.publicPath)

    webpackConfig.resolve
      // This plugin can be removed once we switch to Webpack 6
      .plugin('pnp')
        .use({ ...require('pnp-webpack-plugin') })
        .end()
      .extensions
        .merge(['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'])
        .end()
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))
        .add(resolveLocal('node_modules'))
        .end()
      .alias
        .set('@', api.resolve('src'))

    webpackConfig.resolveLoader
      .plugin('pnp-loaders')
        .use({ ...require('pnp-webpack-plugin').topLevelLoader })
        .end()
      .modules
        .add('node_modules')
        .add(api.resolve('node_modules'))
        .add(resolveLocal('node_modules'))

    webpackConfig.module
      .noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/)

    // js is handled by cli-plugin-babel ---------------------------------------

    // vue-loader --------------------------------------------------------------
    if (vueMajor === 2) {
      // for Vue 2 projects
      const vueLoaderCacheConfig = api.genCacheConfig('vue-loader', {
        'vue-loader': require('vue-loader/package.json').version,
        '@vue/component-compiler-utils': require('@vue/component-compiler-utils/package.json').version,
        'vue-template-compiler': require('vue-template-compiler/package.json').version
      })

      webpackConfig.resolve
        .alias
          .set(
            'vue$',
            options.runtimeCompiler
              ? 'vue/dist/vue.esm.js'
              : 'vue/dist/vue.runtime.esm.js'
          )

      webpackConfig.module
        .rule('vue')
          .test(/\.vue$/)
          .use('cache-loader')
            .loader(require.resolve('cache-loader'))
            .options(vueLoaderCacheConfig)
            .end()
          .use('vue-loader')
            .loader(require.resolve('vue-loader'))
            .options(Object.assign({
              compilerOptions: {
                whitespace: 'condense'
              }
            }, vueLoaderCacheConfig))

      webpackConfig
        .plugin('vue-loader')
          .use(require('vue-loader').VueLoaderPlugin)
    } else if (vueMajor === 3) {
      // for Vue 3 projects
      const vueLoaderCacheConfig = api.genCacheConfig('vue-loader', {
        'vue-loader': require('vue-loader-v16/package.json').version,
        '@vue/compiler-sfc': require('@vue/compiler-sfc/package.json').version
      })

      webpackConfig.resolve
        .alias
          .set(
            'vue$',
            options.runtimeCompiler
              ? 'vue/dist/vue.esm-bundler.js'
              : 'vue/dist/vue.runtime.esm-bundler.js'
          )

      webpackConfig.module
        .rule('vue')
          .test(/\.vue$/)
          .use('cache-loader')
            .loader(require.resolve('cache-loader'))
            .options(vueLoaderCacheConfig)
            .end()
          .use('vue-loader')
            .loader(require.resolve('vue-loader-v16'))
            .options({
              ...vueLoaderCacheConfig,
              babelParserPlugins: ['jsx', 'classProperties', 'decorators-legacy']
            })
            .end()
          .end()

      webpackConfig
        .plugin('vue-loader')
          .use(require('vue-loader-v16').VueLoaderPlugin)

      // feature flags <http://link.vuejs.org/feature-flags>
      webpackConfig
        .plugin('feature-flags')
          .use(require('webpack').DefinePlugin, [{
            __VUE_OPTIONS_API__: 'true',
            __VUE_PROD_DEVTOOLS__: 'false'
          }])
    }

    // Other common pre-processors ---------------------------------------------
    const maybeResolve = name => {
      try {
        return require.resolve(name)
      } catch (error) {
        return name
      }
    }

    webpackConfig.module
      .rule('pug')
        .test(/\.pug$/)
          .oneOf('pug-vue')
            .resourceQuery(/vue/)
            .use('pug-plain-loader')
              .loader(maybeResolve('pug-plain-loader'))
              .end()
            .end()
          .oneOf('pug-template')
            .use('raw')
              .loader(maybeResolve('raw-loader'))
              .end()
            .use('pug-plain-loader')
              .loader(maybeResolve('pug-plain-loader'))
              .end()
            .end()

    // Node.js polyfills
    // They are not polyfilled by default in webpack 5
    // <https://github.com/webpack/webpack/pull/8460>
    // In webpack 4, we used to disabled many of the core module polyfills too
    if (webpackMajor === 4) {
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
    }

    const resolveClientEnv = require('../util/resolveClientEnv')
    webpackConfig
      .plugin('define')
        .use(require('webpack').DefinePlugin, [
          resolveClientEnv(options)
        ])

    webpackConfig
      .plugin('case-sensitive-paths')
        .use(require('case-sensitive-paths-webpack-plugin'))

    // friendly error plugin displays very confusing errors when webpack
    // fails to resolve a loader, so we provide custom handlers to improve it
    const { transformer, formatter } = require('../util/resolveLoaderError')
    webpackConfig
      .plugin('friendly-errors')
        .use(require('@soda/friendly-errors-webpack-plugin'), [{
          additionalTransformers: [transformer],
          additionalFormatters: [formatter]
        }])

    const TerserPlugin = require('terser-webpack-plugin')
    const terserOptions = require('./terserOptions')
    webpackConfig.optimization
      .minimizer('terser')
        .use(TerserPlugin, [terserOptions(options)])
  })
}
