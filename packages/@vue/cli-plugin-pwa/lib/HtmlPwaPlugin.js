const ID = 'vue-cli:pwa-html-plugin'

const defaults = {
  name: 'PWA app',
  themeColor: '#4DBA87', // The Vue color
  msTileColor: '#000000',
  appleMobileWebAppCapable: 'no',
  appleMobileWebAppStatusBarStyle: 'default',
  assetsVersion: '',
  manifestPath: 'manifest.json',
  manifestOptions: {}
}

const defaultManifest = {
  icons: [
    {
      "src": "./img/icons/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "./img/icons/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  start_url: './index.html',
  display: 'standalone',
  background_color: "#000000"
}

const defaultIconPaths = {
  favicon32: 'img/icons/favicon-32x32.png',
  favicon16: 'img/icons/favicon-16x16.png',
  appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
  maskIcon: 'img/icons/safari-pinned-tab.svg',
  msTileImage: 'img/icons/msapplication-icon-144x144.png'
}

module.exports = class HtmlPwaPlugin {
  constructor (options = {}) {
    const iconPaths = Object.assign({}, defaultIconPaths, options.iconPaths)
    delete options.iconPaths
    this.options = Object.assign({ iconPaths: iconPaths }, defaults, options)
  }

  apply (compiler) {
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(ID, (data, cb) => {
        // wrap favicon in the base template with IE only comment
        data.html = data.html.replace(/<link rel="icon"[^>]+>/, '<!--[if IE]>$&<![endif]-->')
        cb(null, data)
      })

      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, (data, cb) => {
        const {
          name,
          themeColor,
          msTileColor,
          appleMobileWebAppCapable,
          appleMobileWebAppStatusBarStyle,
          assetsVersion,
          manifestPath,
          iconPaths
        } = this.options
        const { publicPath } = compiler.options.output

        const assetsVersionStr = assetsVersion ? `?v=${assetsVersion}` : ''

        data.head.push(
          // Favicons
          makeTag('link', {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: `${publicPath}${iconPaths.favicon32}${assetsVersionStr}`
          }),
          makeTag('link', {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            href: `${publicPath}${iconPaths.favicon16}${assetsVersionStr}`
          }),

          // Add to home screen for Android and modern mobile browsers
          makeTag('link', {
            rel: 'manifest',
            href: `${publicPath}${manifestPath}${assetsVersionStr}`
          }),
          makeTag('meta', {
            name: 'theme-color',
            content: themeColor
          }),

          // Add to home screen for Safari on iOS
          makeTag('meta', {
            name: 'apple-mobile-web-app-capable',
            content: appleMobileWebAppCapable
          }),
          makeTag('meta', {
            name: 'apple-mobile-web-app-status-bar-style',
            content: appleMobileWebAppStatusBarStyle
          }),
          makeTag('meta', {
            name: 'apple-mobile-web-app-title',
            content: name
          }),
          makeTag('link', {
            rel: 'apple-touch-icon',
            href: `${publicPath}${iconPaths.appleTouchIcon}${assetsVersionStr}`
          }),
          makeTag('link', {
            rel: 'mask-icon',
            href: `${publicPath}${iconPaths.maskIcon}${assetsVersionStr}`,
            color: themeColor
          }),

          // Add to home screen for Windows
          makeTag('meta', {
            name: 'msapplication-TileImage',
            content: `${publicPath}${iconPaths.msTileImage}${assetsVersionStr}`
          }),
          makeTag('meta', {
            name: 'msapplication-TileColor',
            content: msTileColor
          })
        )

        cb(null, data)
      })


    })

    // generated manifest.json
    compiler.hooks.emit.tapAsync(ID, (data, cb) => {
      const {
        name,
        assetsPublic,
        themeColor,
        manifestPath,
        manifestOptions
      } = this.options

      const publicOptions = {
        name,
        short_name: name,
        theme_color: themeColor
      }

      const manifestFilePath = path.resolve(assetsPublic, manifestPath)
      let fileManifest
      try {
        fileManifest = JSON.parse(
          fs.readFileSync(manifestFilePath).toString()
        )

        // Check the generated manifest.json (without file) is identical to the existing one
        const nofileManifest = Object.assign(publicOptions, defaultManifest, manifestOptions)
        const isIdentical = !Object.keys(fileManifest).find((key) => {
          return (
            JSON.stringify(fileManifest[key]) !==
            JSON.stringify(nofileManifest[key])
          )
        })

        // Throw info or warn
        setTimeout(() => {
          if (isIdentical) {
            info(`You can safely delete the manifest.json redundant file.\nFile Path: ${manifestFilePath}`)
          } else {
            warn(`Recommend: Use pwa.manifestOptions instead of ${manifestFilePath}`)
          }
        }, 1000)
      } catch (err) {
        fileManifest = {}
      }

      const outputManifest = JSON.stringify(
        Object.assign(publicOptions, defaultManifest, fileManifest, manifestOptions)
      )
      data.assets[manifestPath] = {
        source: () => outputManifest,
        size: () => outputManifest.length
      }
      cb(null, data)
    })
  }
}

function makeTag (tagName, attributes, closeTag = false) {
  return {
    tagName,
    closeTag,
    attributes
  }
}
