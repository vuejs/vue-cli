const path = require('path')
const moduleAlias = require('module-alias')

const htmlWebpackPlugin4Path = path.dirname(require.resolve('html-webpack-plugin/package.json'))
// We have to use module-alias for html-webpack-plguin, as it is required by many other plugins
// as peer dependency for its `getHooks` API.
// Should add the alias as early as possible to avoid problems
// TODO: add debugging log here
moduleAlias.addAlias('html-webpack-plugin', htmlWebpackPlugin4Path)

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = (api, options) => {
  api.chainWebpack(config => {
    // Node.js polyfills
    // They are not polyfilled by default in webpack 5
    // <https://github.com/webpack/webpack/pull/8460>
    // In webpack 4, we used to disabled many of the core module polyfills too
    config.node
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

    // Yarn PnP / Yarn 2 support
    config.resolve
      .plugin('pnp')
        .use({ ...require('pnp-webpack-plugin') })
        .end()

    config.resolveLoader
        .plugin('pnp-loaders')
        .use({ ...require('pnp-webpack-plugin').topLevelLoader })
        .end()

    if (process.env.VUE_CLI_BUILD_TARGET === 'app') {
      const CopyWebpackPluginV6 = require('copy-webpack-plugin')
      config
        .plugin('copy')
        .init((Plugin, args) => new CopyWebpackPluginV6(...args))

      if (process.env.NODE_ENV === 'production') {
        // In webpack 5, optimization.chunkIds is set to `deterministic` by default in production
        // In webpack 4, we use the following trick to keep chunk ids stable so async chunks have consistent hash (#1916)
        config
          .plugin('named-chunks')
            .use(require('webpack').NamedChunksPlugin, [chunk => {
              if (chunk.name) {
                return chunk.name
              }

              const hash = require('hash-sum')
              const joinedHash = hash(
                Array.from(chunk.modulesIterable, m => m.id).join('_')
              )
              return `chunk-` + joinedHash
            }])
      }

      if (process.env.NODE_ENV !== 'test') {
        config.optimization.splitChunks({
          cacheGroups: {
            vendors: {
              name: `chunk-vendors`,
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              chunks: 'initial'
            },
            common: {
              name: `chunk-common`,
              minChunks: 2,
              priority: -20,
              chunks: 'initial',
              reuseExistingChunk: true
            }
          }
        })
      }
    }

    if (process.env.NODE_ENV === 'production') {
      const TerserPluginV4 = require('terser-webpack-plugin')
      config.optimization.minimizer('terser').init(
        (Plugin, args) =>
          new TerserPluginV4({
            sourceMap: options.productionSourceMap,
            cache: true,
            ...args
          })
      )

      // DeterministicModuleIdsPlugin is only available in webpack 5
      // (and enabled by default in production mode).

      // In webpack 4, we need HashedModuleIdsPlugin
      // to keep module.id stable when vendor modules does not change.
      // It is "the second best solution for long term caching".
      // <https://github.com/webpack/webpack/pull/7399#discussion_r193970769>
      config.optimization.set('hashedModuleIds', true)
    }
  })
}
