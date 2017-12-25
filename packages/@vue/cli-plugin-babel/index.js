const path = require('path')

module.exports = serivce => {
  serivce.chainWebpack((webpackConfig) => {
    webpackConfig.module
      .rule('js')
        .test(/\.jsx?$/)
        .include
        .add(filepath => {
          const nodeModules = `${path.sep}node_modules${path.sep}`
          // For anything outside node_modules
          if (filepath.indexOf(nodeModules) === -1) {
            return true
          }
          // transpile webpack-dev-server client to ensure it works in older
          // browsers.
          // https://github.com/webpack/webpack-dev-server/pull/1241
          if (filepath.indexOf(`${nodeModules}webpack-dev-server${path.sep}client`) > -1) {
            return true
          }
          return false
        })
        .end()
      .use('babel')
        .loader(require.resolve('babel-loader'))
  })
}
