const path = require('path')

module.exports = (api, { entry, name }, options) => {
  const libName = (
    name ||
    api.service.pkg.name ||
    path.basename(entry).replace(/\.(jsx?|vue)$/, '')
  )
  // setting this disables app-only configs
  process.env.VUE_CLI_TARGET = 'lib'
  // inline all static asset files since there is no publicPath handling
  process.env.VUE_CLI_INLINE_LIMIT = Infinity

  function genConfig (format, postfix = format, genHTML) {
    const config = api.resolveChainableWebpackConfig()

    config.entryPoints.clear()
    const entryName = `${libName}.${postfix}`
    // set proxy entry for *.vue files
    if (/\.vue$/.test(entry)) {
      config
        .entry(entryName)
          .add(require.resolve('./entry-lib.js'))
      config.resolve
        .alias
          .set('~entry', api.resolve(entry))
    } else {
      config
        .entry(entryName)
          .add(api.resolve(entry))
    }

    config.output
      .filename(`${entryName}.js`)
      .chunkFilename(`${entryName}.[id].js`)
      .library(libName)
      .libraryExport('default')
      .libraryTarget(format)
      // use relative publicPath so this can be deployed anywhere
      .publicPath('./')

    // adjust css output name so they write to the same file
    if (options.css.extract !== false) {
      config
        .plugin('extract-css')
          .tap(args => {
            args[0].filename = `${libName}.css`
            return args
          })
    }

    // only minify min entry
    if (!/\.min/.test(postfix)) {
      config.plugins.delete('uglify')
    }

    // externalize Vue in case user imports it
    config
      .externals({
        vue: {
          commonjs: 'vue',
          commonjs2: 'vue',
          root: 'Vue'
        }
      })

    // inject demo page for umd
    if (genHTML) {
      config
        .plugin('demo-html')
          .use(require('html-webpack-plugin'), [{
            template: path.resolve(__dirname, './demo-lib.html'),
            inject: false,
            filename: 'demo.html',
            libName
          }])
    }

    return api.resolveWebpackConfig(config)
  }

  return [
    genConfig('commonjs2', 'common'),
    genConfig('umd', undefined, true),
    genConfig('umd', 'umd.min')
  ]
}
