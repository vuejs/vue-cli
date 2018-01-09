/*
  The MIT License (MIT)
  Copyright (c) 2016 Jan Nicklas
  https://github.com/DustinJackson/html-webpack-inline-source-plugin/blob/master/LICENSE

  Modified by Yuxi Evan You
*/

const path = require('path')
const slash = require('slash')
const sourceMapUrl = require('source-map-url')
const escapeRegex = require('escape-string-regexp')

module.exports = class InlineSourcePlugin {
  constructor (options = {}) {
    this.options = options
  }

  apply (compiler) {
    // Hook into the html-webpack-plugin processing
    compiler.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-before-html-generation', (htmlPluginData, callback) => {
        callback(null, htmlPluginData)
      })
      compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData, callback) => {
        if (!this.options.include) {
          return callback(null, htmlPluginData)
        }
        const regex = this.options.include
        const result = this.processTags(compilation, regex, htmlPluginData)
        callback(null, result)
      })
    })
  }

  processTags (compilation, regex, pluginData) {
    const processTag = tag => this.processTag(compilation, regex, tag)
    return Object.assign({}, pluginData, {
      head: pluginData.head.map(processTag),
      body: pluginData.body.map(processTag)
    })
  }

  processTag (compilation, regex, tag) {
    let assetUrl

    // inline js
    if (tag.tagName === 'script' && regex.test(tag.attributes.src)) {
      assetUrl = tag.attributes.src
      tag = {
        tagName: 'script',
        closeTag: true,
        attributes: {
          type: 'text/javascript'
        }
      }

    // inline css
    } else if (tag.tagName === 'link' && regex.test(tag.attributes.href)) {
      assetUrl = tag.attributes.href
      tag = {
        tagName: 'style',
        closeTag: true,
        attributes: {
          type: 'text/css'
        }
      }
    }

    if (assetUrl) {
      // Strip public URL prefix from asset URL to get Webpack asset name
      const publicUrlPrefix = compilation.outputOptions.publicPath || ''
      const assetName = path.posix.relative(publicUrlPrefix, assetUrl)
      const asset = compilation.assets[assetName]
      // do not emit inlined assets
      delete compilation.assets[assetName]
      const updatedSource = this.resolveSourceMaps(compilation, assetName, asset)
      tag.innerHTML = (tag.tagName === 'script') ? updatedSource.replace(/(<)(\/script>)/g, '\\x3C$2') : updatedSource
    }

    return tag
  }

  resolveSourceMaps (compilation, assetName, asset) {
    let source = asset.source()
    const out = compilation.outputOptions
    // Get asset file absolute path
    const assetPath = path.join(out.path, assetName)
    // Extract original sourcemap URL from source string
    if (typeof source !== 'string') {
      source = source.toString()
    }
    const mapUrlOriginal = sourceMapUrl.getFrom(source)
    // Return unmodified source if map is unspecified, URL-encoded, or already relative to site root
    if (!mapUrlOriginal || mapUrlOriginal.indexOf('data:') === 0 || mapUrlOriginal.indexOf('/') === 0) {
      return source
    }
    // Figure out sourcemap file path *relative to the asset file path*
    const assetDir = path.dirname(assetPath)
    const mapPath = path.join(assetDir, mapUrlOriginal)
    const mapPathRelative = path.relative(out.path, mapPath)
    // Starting with Node 6, `path` module throws on `undefined`
    const publicPath = out.publicPath || ''
    // Prepend Webpack public URL path to source map relative path
    // Calling `slash` converts Windows backslashes to forward slashes
    const mapUrlCorrected = slash(path.join(publicPath, mapPathRelative))
    // Regex: exact original sourcemap URL, possibly '*/' (for CSS), then EOF, ignoring whitespace
    const regex = new RegExp(escapeRegex(mapUrlOriginal) + '(\\s*(?:\\*/)?\\s*$)')
    // Replace sourcemap URL and (if necessary) preserve closing '*/' and whitespace
    return source.replace(regex, (match, group) => {
      return mapUrlCorrected + group
    })
  }
}
