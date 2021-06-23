/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = (api, options) => {
  const getAssetPath = require('../util/getAssetPath')
  const getVueMajor = require('../util/getVueMajor')

  const inlineLimit = 4096

  const vueMajor = getVueMajor(api.getCwd())
  const supportsEsModuleAsset = (vueMajor !== 2)

  const genAssetSubPath = dir => {
    return getAssetPath(
      options,
      `${dir}/[name]${options.filenameHashing ? '.[hash:8]' : ''}.[ext]`
    )
  }

  // TODO: use asset modules for webpack 5
  // <https://webpack.js.org/guides/asset-modules/>

  const genUrlLoaderOptions = dir => {
    return {
      limit: inlineLimit,
      esModule: supportsEsModuleAsset,
      // use explicit fallback to avoid regression in url-loader>=1.1.0
      fallback: {
        loader: require.resolve('file-loader'),
        options: {
          name: genAssetSubPath(dir),
          esModule: supportsEsModuleAsset
        }
      }
    }
  }

  api.chainWebpack(webpackConfig => {
    webpackConfig.module
      .rule('images')
        .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('img'))

    // do not base64-inline SVGs.
    // https://github.com/facebookincubator/create-react-app/pull/1180
    webpackConfig.module
      .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .use('file-loader')
          .loader(require.resolve('file-loader'))
          .options({
            name: genAssetSubPath('img'),
            esModule: supportsEsModuleAsset
          })

    webpackConfig.module
      .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('media'))

    webpackConfig.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
        .use('url-loader')
          .loader(require.resolve('url-loader'))
          .options(genUrlLoaderOptions('fonts'))
  })
}
