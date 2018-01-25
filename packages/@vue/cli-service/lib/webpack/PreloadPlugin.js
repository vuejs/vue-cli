/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modified by Yuxi Evan You
 */

const flatten = arr => arr.reduce((prev, curr) => prev.concat(curr), [])
const getValues = obj => Object.keys(obj).map(key => obj[key])

const doesChunkBelongToHTML = (chunk, roots, visitedChunks) => {
  // Prevent circular recursion.
  // See https://github.com/GoogleChromeLabs/preload-webpack-plugin/issues/49
  if (visitedChunks[chunk.renderedHash]) {
    return false
  }
  visitedChunks[chunk.renderedHash] = true

  for (const root of roots) {
    if (root.hash === chunk.renderedHash) {
      return true
    }
  }

  for (const parent of chunk.parents) {
    if (doesChunkBelongToHTML(parent, roots, visitedChunks)) {
      return true
    }
  }

  return false
}

const defaultOptions = {
  rel: 'preload',
  include: 'asyncChunks',
  fileBlacklist: [/\.map$/]
}

module.exports = class PreloadPlugin {
  constructor (options) {
    this.options = Object.assign({}, defaultOptions, options)
  }

  apply (compiler) {
    const options = this.options
    compiler.plugin('compilation', compilation => {
      // Auto DLL plugin injects assets by mutating html plugin data, so the only
      // way to get a hold of those is by saving the pre-mutated assets and
      // comparing them later.
      let originalAssets
      compilation.plugin('html-webpack-plugin-before-html-generation', (htmlPluginData, cb) => {
        originalAssets = [
          ...htmlPluginData.assets.js,
          ...htmlPluginData.assets.css
        ]
        cb(null, htmlPluginData)
      })

      compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, cb) => {
        let filesToInclude = ''
        let extractedChunks = []
        // 'asyncChunks' are chunks intended for lazy/async loading usually generated as
        // part of code-splitting with import() or require.ensure(). By default, asyncChunks
        // get wired up using link rel=preload when using this plugin. This behaviour can be
        // configured to preload all types of chunks or just prefetch chunks as needed.
        if (options.include === undefined || options.include === 'asyncChunks') {
          try {
            extractedChunks = compilation.chunks.filter(chunk => !chunk.isInitial())
          } catch (e) {
            extractedChunks = compilation.chunks
          }
        } else if (options.include === 'initial') {
          try {
            extractedChunks = compilation.chunks.filter(chunk => chunk.isInitial())
          } catch (e) {
            extractedChunks = compilation.chunks
          }
        } else if (options.include === 'all') {
          // Async chunks, vendor chunks, normal chunks.
          extractedChunks = compilation.chunks
        } else if (Array.isArray(options.include)) {
          // Keep only user specified chunks
          extractedChunks = compilation
              .chunks
              .filter((chunk) => {
                const chunkName = chunk.name
                // Works only for named chunks
                if (!chunkName) {
                  return false
                }
                return options.include.indexOf(chunkName) > -1
              })
        }

        const publicPath = compilation.outputOptions.publicPath || ''

        // Only handle the chunk imported by the htmlWebpackPlugin
        extractedChunks = extractedChunks.filter(chunk => doesChunkBelongToHTML(
          chunk, getValues(htmlPluginData.assets.chunks), {}))

        let files = flatten(extractedChunks.map(chunk => chunk.files))

        // if handling initial or all chunks, also include assets injected by
        // Auto DLL plugin.
        if (options.include === 'initial' || options.include === 'all') {
          files = [...htmlPluginData.assets.js, ...htmlPluginData.assets.css]
              .filter(file => !originalAssets.includes(file))
              .map(file => file.replace(publicPath, ''))
              .concat(files)
        }

        Array.from(new Set(files)).filter(entry => {
          return this.options.fileBlacklist.every(regex => regex.test(entry) === false)
        }).forEach(entry => {
          entry = `${publicPath}${entry}`
          if (options.rel === 'preload') {
            // If `as` value is not provided in option, dynamically determine the correct
            // value depends on suffix of filename. Otherwise use the given `as` value.
            let asValue
            if (!options.as) {
              if (entry.match(/\.css$/)) asValue = 'style'
              else if (entry.match(/\.woff2$/)) asValue = 'font'
              else asValue = 'script'
            } else if (typeof options.as === 'function') {
              asValue = options.as(entry)
            } else {
              asValue = options.as
            }
            const crossOrigin = asValue === 'font' ? 'crossorigin="crossorigin" ' : ''
            filesToInclude += `<link rel="${options.rel}" as="${asValue}" ${crossOrigin}href="${entry}">\n`
          } else {
            // If preload isn't specified, the only other valid entry is prefetch here
            // You could specify preconnect but as we're dealing with direct paths to resources
            // instead of origins that would make less sense.
            filesToInclude += `<link rel="${options.rel}" href="${entry}">\n`
          }
        })
        if (htmlPluginData.html.indexOf('</head>') !== -1) {
          // If a valid closing </head> is found, update it to include preload/prefetch tags
          htmlPluginData.html = htmlPluginData.html.replace('</head>', filesToInclude + '</head>')
        } else {
          // Otherwise assume at least a <body> is present and update it to include a new <head>
          htmlPluginData.html = htmlPluginData.html.replace('<body>', '<head>' + filesToInclude + '</head><body>')
        }
        cb(null, htmlPluginData)
      })
    })
  }
}
