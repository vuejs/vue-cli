const path = require('path')
const {
  filesToComponentNames,
  generateMultiWebComponentEntry
} = require('./generateMultiWcEntry')

module.exports = (api, { target, entry, name, dest, prefix }) => {
  const { log, error } = require('@vue/cli-shared-utils')
  const abort = msg => {
    log()
    error(msg)
    process.exit(1)
  }

  const libName = (
    name ||
    api.service.pkg.name ||
    path.basename(entry).replace(/\.(jsx?|vue)$/, '')
  )
  if (libName.indexOf('-') < 0 && target !== 'multi-wc') {
    abort(`--name must contain a hyphen with --target web-component. (got "${libName}")`)
  }

  let dynamicEntry
  let resolvedFiles
  if (target === 'multi-wc') {
    if (!entry) {
      abort(`a glob pattern is required with --target multi-web-component.`)
    }
    // generate dynamic entry based on glob files
    resolvedFiles = require('globby').sync([entry], { cwd: api.resolve('.') })
    if (!resolvedFiles.length) {
      abort(`glob pattern "${entry}" did not match any files.`)
    }
    dynamicEntry = generateMultiWebComponentEntry(libName, resolvedFiles)
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

    // make sure not to transpile wc-wrapper
    config.module
      .rule('js')
        .exclude
          .add(/vue-wc-wrapper/)

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
            template: path.resolve(__dirname, `./demo-${target}.html`),
            inject: false,
            filename: 'demo.html',
            libName,
            components: target === 'multi-wc'
              ? filesToComponentNames(libName, resolvedFiles).map(c => c.kebabName)
              : null
          }])
    }

    return config.toConfig()
  }

  return [
    genConfig(false, true),
    genConfig(true, false)
  ]
}
