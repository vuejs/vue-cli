exports.clientAddonConfig = function ({ id, port = 8042 }) {
  return {
    baseUrl: `/_addon/${id}`,
    devBaseUrl: `http://localhost:${port}/`,
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
    },
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      port
    }
  }
}
