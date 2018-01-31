module.exports = (api, { entry, name, dest, keepAlive }) => {
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
  // Disable CSS extraction and turn on CSS shadow mode for vue-style-loader
  process.env.VUE_CLI_CSS_SHADOW_MODE = true

  api.chainWebpack(config => {
    config.entryPoints.clear()
    // set proxy entry for *.vue files
    if (/\.vue$/.test(entry)) {
      config
          .entry(libName)
            .add(require.resolve('./entry-web-component.js'))
      config.resolve
          .alias
            .set('~entry', api.resolve(entry))
    } else {
      config
          .entry(libName)
            .add(api.resolve(entry))
    }

    config.output
      .path(api.resolve(dest))
      .filename(`[name].js`)

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
            CUSTOM_ELEMENT_KEEP_ALIVE: keepAlive
          }
        }])

    // enable shadow mode in vue-loader
    config.module
      .rule('vue')
        .use('vue-loader')
          .tap(options => {
            options.shadowMode = true
            return options
          })
  })

  return api.resolveWebpackConfig()
}
