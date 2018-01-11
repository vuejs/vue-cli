module.exports = (api, options) => {
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
          .add(api.resolve('test'))
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
          tslint: options.lintOnSave,
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
  }, args => {
    return require('./lib/tslint')(args, api)
  })
}
