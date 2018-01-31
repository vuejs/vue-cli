module.exports = (api, { entry, name, dest }, options) => {
  const libName = name || api.service.pkg.name || entry.replace(/\.(js|vue)$/, '')
  // setting this disables app-only configs
  process.env.VUE_CLI_TARGET = 'lib'
  // inline all static asset files since there is no publicPath handling
  process.env.VUE_CLI_INLINE_LIMIT = Infinity

  api.chainWebpack(config => {
    config.output
      .path(api.resolve(dest))
      .filename(`[name].js`)
      .library(libName)
      .libraryExport('default')

    // adjust css output name
    if (options.css.extract !== false) {
      config
        .plugin('extract-css')
          .tap(args => {
            args[0].filename = `${libName}.css`
            return args
          })
    }

    // only minify min entry
    config
      .plugin('uglify')
        .tap(args => {
          args[0].include = /\.min\.js$/
          return args
        })

    // externalize Vue in case user imports it
    config
      .externals({
        vue: {
          commonjs: 'vue',
          commonjs2: 'vue',
          root: 'Vue'
        }
      })
  })

  function genConfig (format, postfix = format) {
    api.chainWebpack(config => {
      config.entryPoints.clear()
      // set proxy entry for *.vue files
      if (/\.vue$/.test(entry)) {
        config
          .entry(`${libName}.${postfix}`)
            .add(require.resolve('./entry-lib.js'))
        config.resolve
          .alias
            .set('~entry', api.resolve(entry))
      } else {
        config
          .entry(`${libName}.${postfix}`)
            .add(api.resolve(entry))
      }

      config.output
        .libraryTarget(format)
    })
    return api.resolveWebpackConfig()
  }

  return [
    genConfig('commonjs2', 'common'),
    genConfig('umd'),
    genConfig('umd', 'umd.min')
  ]
}
