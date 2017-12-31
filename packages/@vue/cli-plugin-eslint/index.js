module.exports = (api, { lintOnSave }) => {
  api.registerCommand('lint', {
    descriptions: 'lint source files',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--fix': 'auto fix lint errors in-place'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {

  })

  if (lintOnSave) {
    api.chainWebpack(webpackConfig => {

    })
  }
}
