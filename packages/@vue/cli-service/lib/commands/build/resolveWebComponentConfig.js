const path = require('path')

module.exports = (api, { target, entry, name, dest, prefix }) => {
  const { log, error } = require('@vue/cli-shared-utils')
  const abort = msg => {
    log()
    error(msg)
    process.exit(1)
  }

  const libName = name || api.service.pkg.name || entry.replace(/\.(js|vue)$/, '')
  if (libName.indexOf('-') < 0 && target !== 'multi-wc') {
    abort(`--name must contain a hyphen with --target web-component. (got "${libName}")`)
  }

  let dynamicEntry
  if (target === 'multi-wc') {
    if (!entry) {
      abort(`a glob pattern is required with --target multi-web-component.`)
    }
    // generate dynamic entry based on glob files
    const files = require('globby').sync([entry], { cwd: api.resolve('.') })
    if (!files.length) {
      abort(`glob pattern "${entry}" did not match any files.`)
    }
    dynamicEntry = require('./generateMultiWcEntry')(libName, files)
  }

  // setting this disables app-only configs
  process.env.VUE_CLI_TARGET = 'web-component'
  // inline all static asset files since there is no publicPath handling
  process.env.VUE_CLI_INLINE_LIMIT = Infinity
  // Disable CSS extraction and turn on CSS shadow mode for vue-style-loader
  process.env.VUE_CLI_CSS_SHADOW_MODE = true

  function genConfig (minify, genHTML) {
    const config = api.resolveChainableWebpackConfig()

    config.entryPoints.clear()

    // set proxy entry for *.vue files
    if (target === 'multi-wc') {
      config
        .entry(`${libName}${minify ? `.min` : ``}`)
          .add(dynamicEntry)
      config.resolve
        .alias
          .set('~root', api.resolve('.'))
    } else {
      config
        .entry(`${libName}${minify ? `.min` : ``}`)
          .add(require.resolve('./entry-wc.js'))
      config.resolve
        .alias
          .set('~entry', api.resolve(entry))
    }

    // only minify min entry
    if (!minify) {
      config.plugins.delete('uglify')
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
            CUSTOM_ELEMENT_NAME: JSON.stringify(libName)
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

    if (genHTML) {
      config
        .plugin('demo-html')
          .use(require('html-webpack-plugin'), [{
            template: path.resolve(__dirname, './demo-wc.html'),
            inject: false,
            filename: 'demo.html',
            libName
          }])
    }

    return config.toConfig()
  }

  return [
    genConfig(false, true),
    genConfig(true, false)
  ]
}
