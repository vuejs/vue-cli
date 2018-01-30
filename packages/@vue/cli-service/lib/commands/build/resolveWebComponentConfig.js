module.exports = (api, { libEntry, libName }) => {
  const genConfig = postfix => {
    api.chainWebpack(config => {
      libName = libName || api.service.pkg.name || libEntry.replace(/\.(js|vue)$/, '')

      config.entryPoints.clear()
      // set proxy entry for *.vue files
      if (/\.vue$/.test(libEntry)) {
        config
          .entry(`${libName}.${postfix}`)
            .add(require.resolve('./entry-web-component.js'))
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
          vue: 'Vue'
        })

      // TODO handle CSS (insert in shadow DOM)
    })

    return api.resolveWebpackConfig()
  }

  return [
    genConfig('web-component'),
    genConfig('web-component.min')
  ]
}
