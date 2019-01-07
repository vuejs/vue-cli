// config that are specific to --target app
const fs = require('fs')
const path = require('path')

// ensure the filename passed to html-webpack-plugin is a relative path
// because it cannot correctly handle absolute paths
function ensureRelative (outputDir, _path) {
  if (path.isAbsolute(_path)) {
    return path.relative(outputDir, _path)
  } else {
    return _path
  }
}

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    // only apply when there's no alternative target
    if (process.env.VUE_CLI_BUILD_TARGET && process.env.VUE_CLI_BUILD_TARGET !== 'app') {
      return
    }

    const isProd = process.env.NODE_ENV === 'production'
    const isLegacyBundle = process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD
    const outputDir = api.resolve(options.outputDir)

    // code splitting
    if (isProd && !process.env.CYPRESS_ENV) {
      webpackConfig
        .optimization.splitChunks({
          cacheGroups: {
            vendors: {
              name: `chunk-vendors`,
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              chunks: 'initial'
            },
            common: {
              name: `chunk-common`,
              minChunks: 2,
              priority: -20,
              chunks: 'initial',
              reuseExistingChunk: true
            }
          }
        })
    }

    // HTML plugin
    const resolveClientEnv = require('../util/resolveClientEnv')

    // #1669 html-webpack-plugin's default sort uses toposort which cannot
    // handle cyclic deps in certain cases. Monkey patch it to handle the case
    // before we can upgrade to its 4.0 version (incompatible with preload atm)
    const chunkSorters = require('html-webpack-plugin/lib/chunksorter')
    const depSort = chunkSorters.dependency
    chunkSorters.auto = chunkSorters.dependency = (chunks, ...args) => {
      try {
        return depSort(chunks, ...args)
      } catch (e) {
        // fallback to a manual sort if that happens...
        return chunks.sort((a, b) => {
          // make sure user entry is loaded last so user CSS can override
          // vendor CSS
          if (a.id === 'app') {
            return 1
          } else if (b.id === 'app') {
            return -1
          } else if (a.entry !== b.entry) {
            return b.entry ? -1 : 1
          }
          return 0
        })
      }
    }

    const htmlOptions = {
      templateParameters: (compilation, assets, pluginOptions) => {
        // enhance html-webpack-plugin's built in template params
        let stats
        return Object.assign({
          // make stats lazy as it is expensive
          get webpack () {
            return stats || (stats = compilation.getStats().toJson())
          },
          compilation: compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: pluginOptions
          }
        }, resolveClientEnv(options, true /* raw */))
      }
    }

    if (isProd) {
      // handle indexPath
      if (options.indexPath !== 'index.html') {
        // why not set filename for html-webpack-plugin?
        // 1. It cannot handle absolute paths
        // 2. Relative paths causes incorrect SW manifest to be generated (#2007)
        webpackConfig
          .plugin('move-index')
          .use(require('../webpack/MovePlugin'), [
            path.resolve(outputDir, 'index.html'),
            path.resolve(outputDir, options.indexPath)
          ])
      }

      Object.assign(htmlOptions, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          collapseBooleanAttributes: true,
          removeScriptTypeAttributes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        }
      })

      // keep chunk ids stable so async chunks have consistent hash (#1916)
      webpackConfig
        .plugin('named-chunks')
          .use(require('webpack/lib/NamedChunksPlugin'), [chunk => {
            if (chunk.name) {
              return chunk.name
            }

            const hash = require('hash-sum')
            const joinedHash = hash(
              Array.from(chunk.modulesIterable, m => m.id).join('_')
            )
            return `chunk-` + joinedHash
          }])
    }

    // resolve HTML file(s)
    const HTMLPlugin = require('html-webpack-plugin')
    const PreloadPlugin = require('@vue/preload-webpack-plugin')
    const multiPageConfig = options.pages
    const htmlPath = api.resolve('public/index.html')
    const defaultHtmlPath = path.resolve(__dirname, 'index-default.html')
    const publicCopyIgnore = ['.DS_Store']

    if (!multiPageConfig) {
      // default, single page setup.
      htmlOptions.template = fs.existsSync(htmlPath)
        ? htmlPath
        : defaultHtmlPath

      webpackConfig
        .plugin('html')
          .use(HTMLPlugin, [htmlOptions])

      if (!isLegacyBundle) {
        // inject preload/prefetch to HTML
        webpackConfig
          .plugin('preload')
            .use(PreloadPlugin, [{
              rel: 'preload',
              include: 'initial',
              fileBlacklist: [/\.map$/, /hot-update\.js$/]
            }])

        webpackConfig
          .plugin('prefetch')
            .use(PreloadPlugin, [{
              rel: 'prefetch',
              include: 'asyncChunks'
            }])
      }
    } else {
      // multi-page setup
      webpackConfig.entryPoints.clear()

      const pages = Object.keys(multiPageConfig)
      const normalizePageConfig = c => typeof c === 'string' ? { entry: c } : c

      pages.forEach(name => {
        const pageConfig = normalizePageConfig(multiPageConfig[name])
        const {
          entry,
          template = `public/${name}.html`,
          filename = `${name}.html`,
          chunks = ['chunk-vendors', 'chunk-common', name]
        } = pageConfig

        // Currently Cypress v3.1.0 comes with a very old version of Node,
        // which does not support object rest syntax.
        // (https://github.com/cypress-io/cypress/issues/2253)
        // So here we have to extract the customHtmlOptions manually.
        const customHtmlOptions = {}
        for (const key in pageConfig) {
          if (
            !['entry', 'template', 'filename', 'chunks'].includes(key)
          ) {
            customHtmlOptions[key] = pageConfig[key]
          }
        }

        // inject entry
        webpackConfig.entry(name).add(api.resolve(entry))

        // resolve page index template
        const hasDedicatedTemplate = fs.existsSync(api.resolve(template))
        if (hasDedicatedTemplate) {
          publicCopyIgnore.push(template)
        }
        const templatePath = hasDedicatedTemplate
          ? template
          : fs.existsSync(htmlPath)
            ? htmlPath
            : defaultHtmlPath

        // inject html plugin for the page
        const pageHtmlOptions = Object.assign(
          {},
          htmlOptions,
          {
            chunks,
            template: templatePath,
            filename: ensureRelative(outputDir, filename)
          },
          customHtmlOptions
        )

        webpackConfig
          .plugin(`html-${name}`)
            .use(HTMLPlugin, [pageHtmlOptions])
      })

      if (!isLegacyBundle) {
        pages.forEach(name => {
          const filename = ensureRelative(
            outputDir,
            normalizePageConfig(multiPageConfig[name]).filename || `${name}.html`
          )
          webpackConfig
            .plugin(`preload-${name}`)
              .use(PreloadPlugin, [{
                rel: 'preload',
                includeHtmlNames: [filename],
                include: {
                  type: 'initial',
                  entries: [name]
                },
                fileBlacklist: [/\.map$/, /hot-update\.js$/]
              }])

          webpackConfig
            .plugin(`prefetch-${name}`)
              .use(PreloadPlugin, [{
                rel: 'prefetch',
                includeHtmlNames: [filename],
                include: {
                  type: 'asyncChunks',
                  entries: [name]
                }
              }])
        })
      }
    }

    // CORS and Subresource Integrity
    if (options.crossorigin != null || options.integrity) {
      webpackConfig
        .plugin('cors')
          .use(require('../webpack/CorsPlugin'), [{
            crossorigin: options.crossorigin,
            integrity: options.integrity,
            publicPath: options.publicPath
          }])
    }

    // copy static assets in public/
    const publicDir = api.resolve('public')
    if (!isLegacyBundle && fs.existsSync(publicDir)) {
      webpackConfig
        .plugin('copy')
          .use(require('copy-webpack-plugin'), [[{
            from: publicDir,
            to: outputDir,
            toType: 'dir',
            ignore: publicCopyIgnore
          }]])
    }
  })
}
