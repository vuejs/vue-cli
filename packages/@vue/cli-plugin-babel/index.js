module.exports = (api, {
  parallel,
  transpileDependencies
}) => {
  const useThreads = process.env.NODE_ENV === 'production' && parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')

  api.chainWebpack(webpackConfig => {
    const jsRule = webpackConfig.module
      .rule('js')
        .test(/\.jsx?$/)
        .exclude
          .add(filepath => {
            // check if this is something the user explicitly wants to transpile
            if (transpileDependencies.some(dep => filepath.match(dep))) {
              return false
            }
            // always trasnpile js in vue files
            if (/\.vue\.jsx?$/.test(filepath)) {
              return false
            }
            // Don't transpile node_modules
            return /node_modules/.test(filepath)
          })
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
