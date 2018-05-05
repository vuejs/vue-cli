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

    // resolve entry/output
    const entryName = `${libName}.${postfix}`
    config.resolve
      .alias
        .set('~entry', api.resolve(entry))

    // set entry/output after user configureWebpack hooks are applied
    const rawConfig = api.resolveWebpackConfig(config)

    rawConfig.entry = {
      [entryName]: require.resolve('./entry-lib.js')
    }

    Object.assign(rawConfig.output, {
      filename: `${entryName}.js`,
      chunkFilename: `${entryName}.[id].js`,
      library: libName,
      libraryExport: 'default',
      libraryTarget: format,
      // use dynamic publicPath so this can be deployed anywhere
      // the actual path will be determined at runtime by checking
      // document.currentScript.src.
      publicPath: ''
    })

    return rawConfig
  }

  return [
    genConfig('commonjs2', 'common'),
    genConfig('umd', undefined, true),
    genConfig('umd', 'umd.min')
  ]
}
