/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = (api, options) => {
  api.chainWebpack(config => {
    const HtmlWebpackPlugin4 = require('html-webpack-plugin')
    if (!options.pages) {
      config.plugin('html')
        .init((Plugin, args) => new HtmlWebpackPlugin4(...args))
    } else {
      Object.keys(options.pages).forEach(name => {
        config.plugin(`html-${name}`)
          .init((Plugin, args) => new HtmlWebpackPlugin4(...args))
      })
    }

    // terser-webpack-plugin v4
    // copy-webpack-plugin v6
    // html-webpack-plugin v4
    // css-minimizer-webpack-plugin v1
  })
}
