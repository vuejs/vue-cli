/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = (api, options) => {
  api.chainWebpack(config => {
    if (process.env.VUE_CLI_BUILD_TARGET === 'app') {
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

      // TODO: copy-webpack-plugin v6
    }

    // TODO: terser-webpack-plugin v4
    // TODO: css-minimizer-webpack-plugin v1
  })
}
