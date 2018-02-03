module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const name = api.service.pkg.name

    const userOptions = options.pwa || {}

    // the pwa plugin hooks on to html-webpack-plugin
    // and injects icons, manifest links & other PWA related tags into <head>
    webpackConfig
      .plugin('pwa')
        .use(require('./lib/HtmlPwaPlugin'), [Object.assign({
          name
        }, userOptions)])

    // generate /service-worker.js in production mode
    if (process.env.NODE_ENV === 'production') {
      // Default to GenerateSW mode, though InjectManifest also might be used.
      const workboxPluginMode = userOptions.workboxPluginMode || 'GenerateSW'
      const workboxWebpackModule = require('workbox-webpack-plugin')
      if (workboxPluginMode in workboxWebpackModule) {
        const workBoxConfig = Object.assign({
          cacheId: name,
          exclude: [
            new RegExp('\.map$'),
            new RegExp('img/icons/'),
            new RegExp('favicon\.ico$'),
            new RegExp('manifest\.json$')
          ]
        }, userOptions.workboxOptions)

        webpackConfig
          .plugin('workbox')
          .use(workboxWebpackModule[workboxPluginMode], [workBoxConfig])
      } else {
        throw new Error(`${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
          `Valid modes are: ${Object.keys(workboxWebpackModule).join(', ')}`)
      }
    }
  })

  // install dev server middleware for resetting service worker during dev
  const createNoopServiceWorkerMiddleware = require('./lib/noopServiceWorkerMiddleware')
  api.configureDevServer(app => {
    app.use(createNoopServiceWorkerMiddleware())
  })
}
