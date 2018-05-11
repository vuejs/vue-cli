const ID = 'vue-cli:pwa-html-plugin'

const defaults = {
  name: 'PWA app',
  themeColor: '#4DBA87', // The Vue color
  msTileColor: '#000000',
  appleMobileWebAppCapable: 'no',
  appleMobileWebAppStatusBarStyle: 'default'
}

module.exports = class HtmlPwaPlugin {
  constructor (options = {}) {
    this.options = Object.assign({}, defaults, options)
  }

  apply (compiler) {
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(ID, (data, cb) => {
        // wrap favicon in the base template with IE only comment
        data.html = data.html.replace(/<link rel="icon"[^>]+>/, '<!--[if IE]>$&<![endif]-->')
        cb(null, data)
      })

      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, (data, cb) => {
        const { name, themeColor, msTileColor, appleMobileWebAppCapable, appleMobileWebAppStatusBarStyle } = this.options
        const { publicPath } = compiler.options.output

        data.head.push(
          // Favicons
          makeTag('link', {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: `${publicPath}img/icons/favicon-32x32.png`
          }),
          makeTag('link', {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            href: `${publicPath}img/icons/favicon-16x16.png`
          }),

          // Add to home screen for Android and modern mobile browsers
          makeTag('link', {
            rel: 'manifest',
            href: `${publicPath}manifest.json`
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
            href: `${publicPath}img/icons/apple-touch-icon-152x152.png`
          }),
          makeTag('link', {
            rel: 'mask-icon',
            href: `${publicPath}img/icons/safari-pinned-tab.svg`,
            color: themeColor
          }),

          // Add to home screen for Windows
          makeTag('meta', {
            name: 'msapplication-TileImage',
            content: `${publicPath}img/icons/msapplication-icon-144x144.png`
          }),
          makeTag('meta', {
            name: 'msapplication-TileColor',
            content: msTileColor
          })
        )

        cb(null, data)
      })
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
