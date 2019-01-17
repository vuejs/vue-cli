exports.clientAddonConfig = function ({ id, port = 8042 }) {
  return {
    publicPath: process.env.NODE_ENV === 'production'
      ? `/_addon/${id}`
      : `http://localhost:${port}/`,
    configureWebpack: {
      output: {
        // Important
        filename: 'index.js'
      }
    },
    css: {
      extract: false
    },
    chainWebpack: config => {
      config.plugins.delete('preload')
      config.plugins.delete('prefetch')
      config.plugins.delete('html')
      config.plugins.delete('optimize-css')
      config.optimization.splitChunks(false)

      config.module
        .rule('gql')
        .test(/\.(gql|graphql)$/)
        .use('gql-loader')
        .loader('graphql-tag/loader')
        .end()
    },
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      port
    }
  }
}
