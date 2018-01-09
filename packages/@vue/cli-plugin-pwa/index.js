module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const name = api.service.pkg.name

    // make sure the registerServiceWorker script is transpiled
    webpackConfig.module
      .rule('js')
        .include
          .add(require.resolve('./registerServiceWorker'))

    // the pwa plugin hooks on to html-webpack-plugin
    // and injects icons, manifest links & other PWA related tags into <head>
    webpackConfig
      .plugin('pwa')
        .use(require('./lib/HtmlPwaPlugin'), [Object.assign({
          name
        }, options.pwa)])

    // generate /service-worker.js in production mode
    if (process.env.NODE_ENV === 'production') {
      webpackConfig
        .plugin('sw-precache')
          .use(require('sw-precache-webpack-plugin'), [{
            cacheId: name,
            filename: 'service-worker.js',
            staticFileGlobs: [`${options.outputDir}/**/*.{js,html,css}`],
            minify: true,
            stripPrefix: `${options.outputDir}/`
          }])
    }
  })

  // install dev server middleware for resetting service worker during dev
  const createNoopServiceWorkerMiddleware = require('./lib/noopServiceWorkerMiddleware')
  api.configureDevServer(app => {
    app.use(createNoopServiceWorkerMiddleware())
  })
}
