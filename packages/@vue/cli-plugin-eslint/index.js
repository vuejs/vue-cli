module.exports = (api, { lintOnSave }) => {
  if (lintOnSave) {
    const options = require('./eslintOptions')(api)
    api.chainWebpack(webpackConfig => {
      webpackConfig.module
        .rule('eslint')
          .pre()
          .include
            .add(api.resolve('src'))
            .add(api.resolve('test'))
            .end()
          .test(/\.(vue|(j|t)sx?)$/)
          .use('eslint-loader')
            .loader('eslint-loader')
            .options(Object.assign(options, {
              emitWarning: lintOnSave !== 'error',
              formatter: require('eslint/lib/formatters/codeframe')
            }))
    })
  }

  api.registerCommand('lint', {
    description: 'lint and fix source files',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format [formatter]': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {
    require('./lint')(args, api)
  })
}
