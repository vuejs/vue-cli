module.exports = (api, { lintOnSave }) => {
  if (lintOnSave) {
    const options = require('./eslintOptions')
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
            .options(Object.assign(options, {
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
    require('./lint')(api.resolve('.'), args)
  })
}
