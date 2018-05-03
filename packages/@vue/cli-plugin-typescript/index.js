module.exports = (api, {
  parallel,
  lintOnSave,
  experimentalCompileTsWithBabel
}) => {
  const fs = require('fs')
  const useThreads = process.env.NODE_ENV === 'production' && parallel
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

    const vueLoader = config.module
      .rule('vue')
        .use('vue-loader')

    // add a loader to both *.ts & vue<lang="ts">
    const addLoader = loader => {
      const use = tsRule
        .use(loader.loader)
          .loader(loader.loader)
      if (loader.options) {
        use.options(loader.options)
      }
      vueLoader.tap(options => {
        options.loaders = options.loaders || {}
        options.loaders.ts = options.loaders.ts || []
        options.loaders.ts.push(loader)
        options.loaders.tsx = options.loaders.tsx || []
        if (loader.loader === 'ts-loader') {
          // for TSX need to append tsx suffix
          options.loaders.tsx.push({
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsxSuffixTo: [/\.vue$/],
              happyPackMode: useThreads
            }
          })
        } else {
          options.loaders.tsx.push(loader)
        }
        return options
      })
    }

    addLoader({
      loader: 'cache-loader',
      options: { cacheDirectory }
    })
    if (useThreads) {
      addLoader({
        loader: 'thread-loader'
      })
    }

    if (!experimentalCompileTsWithBabel) {
      if (api.hasPlugin('babel')) {
        addLoader({
          loader: 'babel-loader'
        })
      }
      addLoader({
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          appendTsSuffixTo: [/\.vue$/],
          // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
          happyPackMode: useThreads
        }
      })
    } else {
      // Experimental: compile TS with babel so that it can leverage
      // preset-env for auto-detected polyfills based on browserslists config.
      // this is pending on the readiness of @babel/preset-typescript.
      addLoader({
        loader: 'babel-loader'
      })
    }

    config
      .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [{
          vue: true,
          tslint: lintOnSave !== false && fs.existsSync(api.resolve('tslint.json')),
          formatter: 'codeframe',
          // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
          checkSyntacticErrors: useThreads
        }])
  })

  if (!api.hasPlugin('eslint')) {
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
}
