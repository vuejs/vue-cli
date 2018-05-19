module.exports = (api, { lintOnSave }) => {
  if (lintOnSave) {
    const extensions = require('./eslintOptions').extensions(api)
    api.chainWebpack(webpackConfig => {
      webpackConfig.module
        .rule('eslint')
          .pre()
          .exclude
            .add(/node_modules/)
            .add(require('path').dirname(require.resolve('@vue/cli-service')))
            .end()
          .test(/\.(vue|(j|t)sx?)$/)
          .use('eslint-loader')
            .loader('eslint-loader')
            .options({
              extensions,
              emitWarning: lintOnSave !== 'error',
              formatter: require('eslint/lib/formatters/codeframe')
            })
    })
  }

  api.registerCommand('lint', {
    description: 'lint and fix source files',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format [formatter]': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors',
      '--max-errors [limit]': 'specify number of errors to make build failed (default: 0)',
      '--max-warnings [limit]': 'specify number of warnings to make build failed (default: Infinity)'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {
    require('./lint')(args, api)
  })
}
