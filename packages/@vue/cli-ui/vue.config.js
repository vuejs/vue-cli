const merge = require('deepmerge')
const path = require('path')

/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
  lintOnSave: process.env.CIRCLECI
    ? false
    : 'default',
  pluginOptions: {
    apollo: {
      enableMocks: false,
      enableEngine: false,
      lintGQL: false
    }
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
  },

  css: {
    loaderOptions: {
      stylus: {
        import: ['~@/style/imports']
      }
    }
  },
  parallel: !process.env.CIRCLECI
}
