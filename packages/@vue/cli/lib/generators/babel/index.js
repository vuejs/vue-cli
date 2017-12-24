module.exports = api => {
  api.onPromptComplete(options => {
    if (!options.features.includes('ts')) {
      api.injectDeps({
        '@vue/cli-plugin-babel': '^1.0.0',
        'babel-preset-vue-app': '^2.0.0'
      })
      api.injectFileMiddleware(files => {
        files['.babelrc'] = api.renderFile('./files/.babelrc')
      })
    }
  })
}
