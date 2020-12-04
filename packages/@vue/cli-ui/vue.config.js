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

  css: {
    loaderOptions: {
      stylus: {
        import: ['~@/style/imports']
      }
    }
  },
  parallel: !process.env.CIRCLECI
}
