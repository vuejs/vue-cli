module.exports = (api, { entry, name, keepAlive, shadow }) => {
  const libName = name || api.service.pkg.name || entry.replace(/\.(js|vue)$/, '')
  if (libName.indexOf('-') < 0) {
    const { log, error } = require('@vue/cli-shared-utils')
    log()
    error(`--name must contain a hyphen when building as web-component. (got "${libName}")`)
    process.exit(1)
  }

  // setting this disables app-only configs
  process.env.VUE_CLI_TARGET = 'web-component'
  // inline all static asset files since there is no publicPath handling
  process.env.VUE_CLI_INLINE_LIMIT = Infinity

  api.chainWebpack(config => {
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

    config
      .plugin('web-component-options')
        .use(require('webpack/lib/DefinePlugin'), [{
          'process.env': {
            CUSTOM_ELEMENT_NAME: JSON.stringify(libName),
            CUSTOM_ELEMENT_KEEP_ALIVE: keepAlive,
            CUSTOM_ELEMENT_USE_SHADOW_DOM: shadow
          }
        }])

    // TODO handle CSS (insert in shadow DOM)
  })

  function genConfig (postfix) {
    postfix = postfix ? `.${postfix}` : ``
    api.chainWebpack(config => {
      config.entryPoints.clear()
      // set proxy entry for *.vue files
      if (/\.vue$/.test(entry)) {
        config
          .entry(`${libName}${postfix}`)
            .add(require.resolve('./entry-web-component.js'))
        config.resolve
          .alias
            .set('~entry', api.resolve(entry))
      } else {
        config
          .entry(`${libName}${postfix}`)
            .add(api.resolve(entry))
      }
    })
    return api.resolveWebpackConfig()
  }

  return [
    genConfig(''),
    genConfig('min')
  ]
}
