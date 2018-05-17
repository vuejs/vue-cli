// hack babel's codegen to fix source map.
// this is a temporary patch before the actual change is released.
// TODO remove after upgrading Babel to 7.0.0-beta.47
require('./patchBabel')

const { babelHelpers } = require('@vue/cli-shared-utils')

module.exports = (api, {
  parallel,
  transpileDependencies
}) => {
  const useThreads = process.env.NODE_ENV === 'production' && parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')
  const cliServicePath = require('path').dirname(require.resolve('@vue/cli-service'))

  api.chainWebpack(webpackConfig => {
    const jsRule = webpackConfig.module
      .rule('js')
        .test(/\.jsx?$/)
        .exclude
          .add(filepath => {
            // always trasnpile js in vue files
            if (/\.vue\.jsx?$/.test(filepath)) {
              return false
            }
            // exclude dynamic entries from cli-service
            if (filepath.startsWith(cliServicePath)) {
              return true
            }
            // Don't transpile node_modules
            return /node_modules/.test(filepath)
          })
          .end()
        .use('cache-loader')
          .loader('cache-loader')
          .options({ cacheDirectory })
          .end()

    if (useThreads) {
      jsRule
        .use('thread-loader')
          .loader('thread-loader')
    }

    jsRule
      .use('babel-loader')
        .loader('babel-loader')

    // config for external dependencies
    if (transpileDependencies.length !== 0) {
      const jsExternals = webpackConfig.module
        .rule('js-externals')
         .test(/\.jsx?$/)
          .exclude
            .add(filepath => {
              // include only from `transpileDependencies` list
              if (transpileDependencies.some(dep => filepath.match(dep))) {
                return false
              }
              return true
            })
            .end()
          .use('cache-loader')
            .loader('cache-loader')
            .options({ cacheDirectory })
            .end()

      if (useThreads) {
        jsExternals
          .use('thread-loader')
            .loader('thread-loader')
      }

      // `babelrc` = false
      // find nearest babel config from project's root
      const config = babelHelpers.loadUsersConfig(api.resolve('.'))

      jsExternals
        .use('babel-loader')
          .loader('babel-loader')
            .options(config)
    }
  })
}
