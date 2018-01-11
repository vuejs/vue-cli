module.exports = api => {
  api.chainWebpack(config => {
    config.entry('app')
      .clear()
      .add('./src/main.ts')

    config.resolve
      .extensions
        .merge(['.ts', '.tsx'])

    config.module
      .rule('ts')
        .test(/\.tsx?$/)
        .include
          .add(api.resolve('src'))
          .end()
        .use('ts-loader')
          .loader('ts-loader')
          .options({
            transpileOnly: true,
            appendTsSuffixTo: [/\.vue$/]
          })

    config
      .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [{
          vue: true,
          tslint: true,
          formatter: 'codeframe'
        }])
  })

  api.registerCommand('lint', {
    descriptions: 'lint source files with TSLint',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors'
    },
    details: 'For more options, see https://palantir.github.io/tslint/usage/cli/'
  }, (args) => {
    const { run } = require('tslint/lib/runner')

    // TODO make this support *.vue files
    return run({
      files: args._ && args._.length ? args._ : ['src/**/*.ts'],
      exclude: args.exclude || [],
      fix: !args['no-fix'],
      project: api.resolve('tsconfig.json'),
      config: api.resolve('tslint.json'),
      force: args.force,
      format: args.format,
      formattersDirectory: args['formatters-dir'],
      init: args.init,
      out: args.out,
      outputAbsolutePaths: args['output-absolute-paths'],
      rulesDirectory: args['rules-dir'],
      test: args.test,
      typeCheck: args['type-check']
    }, {
      log (m) { process.stdout.write(m) },
      error (m) { process.stdout.write(m) }
    }).then(code => {
      process.exitCode = code
    }).catch(err => {
      console.error(err)
      process.exitCode = 1
    })
  })
}
