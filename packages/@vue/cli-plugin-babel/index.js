module.exports = (api, options) => {
  const { genCacheConfig } = require('@vue/cli-shared-utils')
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
            // check if this is something the user explicitly wants to transpile
            if (options.transpileDependencies.some(dep => filepath.match(dep))) {
              return false
            }
            // Don't transpile node_modules
            return /node_modules/.test(filepath)
          })
          .end()
        .use('cache-loader')
          .loader('cache-loader')
          .options(genCacheConfig(api, options, 'babel-loader', 'babel.config.js'))
          .end()

    jsRule
      .use('babel-loader')
        .loader('babel-loader')
  })
}
