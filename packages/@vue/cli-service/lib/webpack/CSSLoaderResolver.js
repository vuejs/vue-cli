/**
 * https://github.com/egoist/webpack-handle-css-loader
 * The MIT License (MIT)
 * Copyright (c) EGOIST <0x142857@gmail.com> (github.com/egoist)
 *
 * Modified by Yuxi Evan You
 */

const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = class CSSLoaderResolver {
  /**
   * @param {Object} options
   * @param {boolean} [options.sourceMap=undefined] Enable sourcemaps.
   * @param {boolean} [options.modules=undefined]  Enable CSS modules.
   * @param {string} [options.localIdentName='[name]_[local]__[hash:base64:5]']  Customizes CSS modules localIdentName.
   * @param {boolean} [options.extract=undefined] Extract CSS.
   * @param {boolean} [options.minimize=undefined] Minimize CSS.
   * @param {boolean} [options.postcss=undefined] Enable postcss-loader.
   * @param {Object} [options.loaderOptions={}] Options to pass on to loaders.
   */
  constructor ({
    sourceMap,
    modules,
    localIdentName,
    extract,
    minimize,
    postcss,
    loaderOptions
  } = {}) {
    this.cssLoader = 'css-loader'
    this.fallbackLoader = 'vue-style-loader'
    this.sourceMap = sourceMap
    this.extract = extract && !process.env.VUE_CLI_CSS_SHADOW_MODE
    this.minimize = minimize
    this.modules = modules
    this.localIdentName = localIdentName
    this.postcss = postcss
    this.loaderOptions = loaderOptions || {}
  }

  getLoader (test, loader, options = {}) {
    const cssLoaderOptions = {
      sourceMap: this.sourceMap,
      minimize: this.minimize
    }

    if (this.modules) {
      cssLoaderOptions.modules = true
      cssLoaderOptions.importLoaders = 1
      cssLoaderOptions.localIdentName = this.localIdentName
    }

    if (loader === 'css') {
      Object.assign(cssLoaderOptions, options)
    }

    const use = [{
      loader: this.cssLoader,
      options: cssLoaderOptions
    }]

    if (loader !== 'postcss' && this.postcss !== false) {
      use.push({
        loader: 'postcss-loader',
        options: {
          sourceMap: this.sourceMap
        }
      })
    }

    if (loader && loader !== 'css') {
      use.push({
        loader: loader + '-loader',
        options: Object.assign({}, this.loaderOptions[loader] || {}, options, {
          sourceMap: this.sourceMap
        })
      })
    }

    return {
      test,
      use: this.extract ? ExtractTextPlugin.extract({
        use,
        fallback: this.fallbackLoader
      }) : [{
        loader: this.fallbackLoader,
        options: {
          shadowMode: !!process.env.VUE_CLI_CSS_SHADOW_MODE,
          sourceMap: this.sourceMap
        }
      }, ...use]
    }
  }

  css (test = /\.css$/) {
    return this.getLoader(test, 'css')
  }

  sass (test = /\.sass$/) {
    return this.getLoader(test, 'sass', {
      indentedSyntax: true
    })
  }

  scss (test = /\.scss$/) {
    return this.getLoader(test, 'sass')
  }

  less (test = /\.less$/) {
    return this.getLoader(test, 'less')
  }

  styl (test = /\.styl$/) {
    return this.getLoader(test, 'stylus')
  }

  stylus (test = /\.stylus$/) {
    return this.getLoader(test, 'stylus')
  }

  vue () {
    const originalPostcss = this.postcss
    const originalModules = this.modules
    this.postcss = false
    this.modules = false
    const loaders = {}
    for (const lang of ['css', 'sass', 'scss', 'less', 'stylus', 'styl']) {
      loaders[lang] = this[lang]().use
    }
    this.postcss = originalPostcss
    this.modules = originalModules
    return loaders
  }
}
