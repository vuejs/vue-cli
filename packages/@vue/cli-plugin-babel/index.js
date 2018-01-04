const path = require('path')

module.exports = api => {
  api.chainWebpack(webpackConfig => {
    webpackConfig.module
      .rule('js')
        .test(/\.jsx?$/)
        .include
          .add(api.resolve('src'))
          .add(api.resolve('test'))
          .end()
        .use('babel-loader')
          .loader(require.resolve('babel-loader'))
  })
}
