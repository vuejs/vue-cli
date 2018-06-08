module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const target = process.env.VUE_CLI_BUILD_TARGET
    if (target && target !== 'app') {
      return
    }

    const name = api.service.pkg.name
    const userOptions = options.pwa || {}

    // the pwa plugin hooks on to html-webpack-plugin
    // and injects icons, manifest links & other PWA related tags into <head>
    webpackConfig
      .plugin('pwa')
        .use(require('./lib/HtmlPwaPlugin'), [Object.assign({
          name
        }, userOptions)])
        .after('html')

    // generate /service-worker.js in production mode
    if (process.env.NODE_ENV === 'production') {
      // Default to GenerateSW mode, though InjectManifest also might be used.
      const workboxPluginMode = userOptions.workboxPluginMode || 'GenerateSW'
      const workboxWebpackModule = require('workbox-webpack-plugin')

      if (!(workboxPluginMode in workboxWebpackModule)) {
        throw new Error(
          `${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
          `Valid modes are: ${Object.keys(workboxWebpackModule).join(', ')}`
        )
      }

      const defaultOptions = {
        exclude: [
          /\.map$/,
          /img\/icons\//,
          /favicon\.ico$/,
          /manifest\.json$/
        ]
      }

      const defaultGenerateSWOptions = workboxPluginMode === 'GenerateSW' ? {
        cacheId: name
      } : {}

      const workBoxConfig = Object.assign(defaultOptions, defaultGenerateSWOptions, userOptions.workboxOptions)

      webpackConfig
        .plugin('workbox')
        .use(workboxWebpackModule[workboxPluginMode], [workBoxConfig])
    }
  })

  // install dev server middleware for resetting service worker during dev
  const createNoopServiceWorkerMiddleware = require('./lib/noopServiceWorkerMiddleware')
  api.configureDevServer(app => {
    app.use(createNoopServiceWorkerMiddleware())
  })
}
