const merge = require('deepmerge')
const path = require('path')

module.exports = {
  pluginOptions: {
    graphqlMock: false,
    apolloEngine: false,
    graphqlTimeout: 1000000
  },

  configureWebpack: {
    resolve: {
      symlinks: false
    }
  },

  chainWebpack: config => {
    config.module.rule('stylus').oneOf('vue').use('postcss-loader')
      .tap(options =>
        merge(options, {
          config: {
            path: path.resolve(__dirname, '.postcssrc')
          }
        })
      )
  }
}
