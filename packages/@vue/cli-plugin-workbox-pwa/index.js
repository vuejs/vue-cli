// forked from vue-cli-plugin-pwa

const fs = require('fs')
const { chalk, warn } = require('@vue/cli-shared-utils')

module.exports = (api, options) => {
  const userOptions = options.pwa || {}

  const manifestPath = api.resolve('public/manifest.json')
  if (fs.existsSync(manifestPath)) {
    if (!userOptions.manifestOptions) {
      userOptions.manifestOptions = require(manifestPath)
    } else {
      warn(
        `The ${chalk.red('public/manifest.json')} file will be ignored in favor of ${chalk.cyan('pwa.manifestOptions')}`
      )
    }
  }

  api.chainWebpack(webpackConfig => {
    const target = process.env.VUE_CLI_BUILD_TARGET
    if (target && target !== 'app') {
      return
    }

    const name = api.service.pkg.name

    // the pwa plugin hooks on to html-webpack-plugin
    // and injects icons, manifest links & other PWA related tags into <head>
    webpackConfig
      .plugin('pwa')
        .use(require('./lib/HtmlPwaPlugin'), [Object.assign({
          name
        }, userOptions)])
        .after('html')

    webpackConfig
      .plugin('html')
      .tap(args => {
        args[0].title = userOptions.name // Add title to the app bar when installed as PWA.
        return args
      })

    // generate /service-worker.js in production mode or pwalocalserve
    // Workbox requires NODE_ENV='development' to show debugging statements for the service worker, so
    // we attempt to achieve the same thing here when VUE_APP_PWA_LOCAL_SERVE is true.
    if (process.env.NODE_ENV === 'production' || process.env.VUE_APP_PWA_LOCAL_SERVE === 'true') {
      // Default to InjectManifest.
      const workboxPluginMode = userOptions.workboxPluginMode || 'InjectManifest'
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
          /^manifest.*\.js?$/
        ]
      }

      const defaultGenerateSWOptions = workboxPluginMode === 'GenerateSW'
        ? { cacheId: name }
        : {}

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
