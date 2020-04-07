const path = require('path')

module.exports = (api, projectOptions) => {
  const fs = require('fs')
  const useThreads = process.env.NODE_ENV === 'production' && !!projectOptions.parallel

  api.chainWebpack(config => {
    config.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'))

    if (!projectOptions.pages) {
      config.entry('app')
        .clear()
        .add('./src/main.ts')
    }

    config.resolve
      .extensions
        .prepend('.ts')
        .prepend('.tsx')

    const tsRule = config.module.rule('ts').test(/\.ts$/)
    const tsxRule = config.module.rule('tsx').test(/\.tsx$/)

    // add a loader to both *.ts & vue<lang="ts">
    const addLoader = ({ name, loader, options }) => {
      tsRule.use(name).loader(loader).options(options)
      tsxRule.use(name).loader(loader).options(options)
    }

    addLoader({
      name: 'cache-loader',
      loader: require.resolve('cache-loader'),
      options: api.genCacheConfig('ts-loader', {
        'ts-loader': require('ts-loader/package.json').version,
        'typescript': require('typescript/package.json').version,
        modern: !!process.env.VUE_CLI_MODERN_BUILD
      }, 'tsconfig.json')
    })

    if (useThreads) {
      addLoader({
        name: 'thread-loader',
        loader: require.resolve('thread-loader'),
        options:
          typeof projectOptions.parallel === 'number'
            ? { workers: projectOptions.parallel }
            : {}
      })
    }

    if (api.hasPlugin('babel')) {
      addLoader({
        // TODO: I guess the intent is to require the `babel-loader` provided by the Babel vue
        // plugin, but that means we now rely on the hoisting. It should instead be queried
        // against the plugin itself, or through a peer dependency.
        name: 'babel-loader',
        // eslint-disable-next-line node/no-extraneous-require
        loader: require.resolve('babel-loader')
      })
    }
    addLoader({
      name: 'ts-loader',
      loader: require.resolve('ts-loader'),
      options: {
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$'],
        // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
        happyPackMode: useThreads
      }
    })
    // make sure to append TSX suffix
    tsxRule.use('ts-loader').loader(require.resolve('ts-loader')).tap(options => {
      options = Object.assign({}, options)
      delete options.appendTsSuffixTo
      options.appendTsxSuffixTo = ['\\.vue$']
      return options
    })

    if (!process.env.VUE_CLI_TEST) {
      // try to load `@vue/compiler-sfc` if the project is using Vue 3.
      // if it is not available, it uses `vue-template-compiler`
      let compiler = '@vue/compiler-sfc'
      try {
        require.resolve(compiler)
        // use a shim as @vue/compiler-sfc does not offer the `parseComponent` function
        // but a `parse` function
        // the shim only delegates to the parse function
        compiler = '@vue/cli-plugin-typescript/vue-compiler-sfc-shim'
      } catch (e) {
        compiler = 'vue-template-compiler'
      }
      // this plugin does not play well with jest + cypress setup (tsPluginE2e.spec.js) somehow
      // so temporarily disabled for vue-cli tests
      config
        .plugin('fork-ts-checker')
          .use(require('fork-ts-checker-webpack-plugin'), [{
            vue: { enabled: true, compiler },
            tslint: projectOptions.lintOnSave !== false && fs.existsSync(api.resolve('tslint.json')),
            formatter: 'codeframe',
            // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
            checkSyntacticErrors: useThreads
          }])
    }
  })

  if (!api.hasPlugin('eslint')) {
    api.registerCommand('lint', {
      description: 'lint source files with TSLint',
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
