module.exports = api => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'production') {

    }
  })
}
