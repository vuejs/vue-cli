module.exports = (api, options) => {
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')

  api.chainWebpack(config => {
    config.entry('app')
      .clear()
      .add('./src/main.ts')

    config.resolve
      .extensions
        .merge(['.ts', '.tsx'])

    const tsRule = config.module
      .rule('ts')
        .test(/\.tsx?$/)
        .include
          .add(api.resolve('src'))
          .add(api.resolve('test'))
          .end()
        .use('cache-loader')
          .loader('cache-loader')
          .options({ cacheDirectory })
          .end()

    const vueLoader = config.module
      .rule('vue')
        .use('vue-loader')
        .tap(options => {
          options.loaders = options.loaders || {}
          options.loaders.ts = [
            {
              loader: 'cache-loader',
              options: { cacheDirectory }
            }
          ]
          return options
        })

    if (!options.experimentalCompileTsWithBabel) {
      const tsLoaderOptions = {
        transpileOnly: true,
        appendTsSuffixTo: [/\.vue$/]
      }

      // if has babel plugin, inject babel-loader before ts-loader
      if (api.hasPlugin('babel')) {
        tsRule
          .use('babel-loader')
            .loader('babel-loader')
        vueLoader
          .tap(options => {
            options.loaders.ts.push({
              loader: 'babel-loader'
            })
            return options
          })
      }

      // apply ts-loader
      tsRule
        .use('ts-loader')
          .loader('ts-loader')
          .options(tsLoaderOptions)
      vueLoader
        .tap(options => {
          options.loaders.ts.push({
            loader: 'ts-loader',
            options: tsLoaderOptions
          })
          return options
        })
    } else {
      // Experimental: compile TS with babel so that it can leverage
      // preset-env for auto-detected polyfills based on browserslists config.
      // this is pending on the readiness of @babel/preset-typescript.
      tsRule
        .use('babel-loader')
          .loader('babel-loader')
      vueLoader
        .tap(options => {
          options.loaders.ts.push(
            {
              loader: 'babel-loader'
            }
          )
          return options
        })
    }

    config
      .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [{
          vue: true,
          tslint: options.lintOnSave,
          formatter: 'codeframe'
        }])
  })

  api.registerCommand('lint', {
    descriptions: 'lint source files with TSLint',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format [formatter]': 'specify formatter (default: codeFrame)',
      '--no-fix': 'do not fix errors',
      '--formatters-dir [dir]': 'formatter directory',
      '--rules-dir [dir]': 'rules directory'
    }
  }, args => {
    return require('./lib/tslint')(args, api)
  })
}
