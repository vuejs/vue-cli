module.exports = {
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
    config.module.rule('gql').uses.delete('cache-loader')
  },

  css: {
    loaderOptions: {
      stylus: {
        stylusOptions: {
          import: ['~@/style/imports']
        }
      }
    }
  },
  parallel: !process.env.CIRCLECI
}
