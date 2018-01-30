module.exports = (api, { libEntry, libName }) => {
  const genConfig = (format, postfix = format) => {
    api.chainWebpack(config => {
      libName = libName || api.service.pkg.name || libEntry.replace(/\.(js|vue)$/, '')

      config.entryPoints.clear()
      // set proxy entry for *.vue files
      if (/\.vue$/.test(libEntry)) {
        config
          .entry(`${libName}.${postfix}`)
            .add(require.resolve('./entry-lib.js'))
        config.resolve
          .alias
            .set('~entry', api.resolve(libEntry))
      } else {
        config
          .entry(`${libName}.${postfix}`)
            .add(api.resolve(libEntry))
      }

      config.output
        .filename(`[name].js`)
        .library(libName)
        .libraryExport('default')
        .libraryTarget(format)

      // adjust css output name
      config
        .plugin('extract-css')
          .tap(args => {
            args[0].filename = `${libName}.css`
            return args
          })

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

    return api.resolveWebpackConfig()
  }

  return [
    genConfig('commonjs2', 'common'),
    genConfig('umd'),
    genConfig('umd', 'umd.min')
  ]
}
