module.exports = {
  configureWebpack: {
    output: {
      publicPath: 'http://localhost:8081/'
    }
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
