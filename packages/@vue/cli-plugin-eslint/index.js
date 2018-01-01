module.exports = (api, { lintOnSave }) => {
  if (lintOnSave) {
    api.chainWebpack(webpackConfig => {
      webpackConfig.module
        .rule('eslint')
          .pre()
          .include
            .add(api.resolve('src'))
            .add(api.resolve('test'))
            .end()
          .test(/\.(vue|jsx?)$/)
          .use('eslint-loader')
            .loader('eslint-loader')
            .options({
              fix: true,
              formatter: require('eslint/lib/formatters/codeframe')
            })
    })
  }

  api.registerCommand('lint', {
    descriptions: 'lint source files',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {
    require('./lint')(api.resolve('.'), args)
  })
}
