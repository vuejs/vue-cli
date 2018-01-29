module.exports = (api, options) => {
  const useThreads = process.env.NODE_ENV === 'production' && options.parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')

  api.chainWebpack(webpackConfig => {
    const jsRule = webpackConfig.module
      .rule('js')
        .test(/\.jsx?$/)
        .include
          .add(api.resolve('src'))
          .add(api.resolve('test'))
          .end()
        .use('cache-loader')
          .loader('cache-loader')
          .options({ cacheDirectory })
          .end()

    if (useThreads) {
      jsRule
        .use('thread-loader')
          .loader('thread-loader')
    }

    jsRule
      .use('babel-loader')
        .loader('babel-loader')

    webpackConfig.module
      .rule('vue')
        .use('vue-loader')
        .tap(options => {
          options.loaders = options.loaders || {}
          options.loaders.js = [
            {
              loader: 'cache-loader',
              options: { cacheDirectory }
            }
          ]
          if (useThreads) {
            options.loaders.js.push({
              loader: 'thread-loader'
            })
          }
          options.loaders.js.push({
            loader: 'babel-loader'
          })
          return options
        })
  })
}
