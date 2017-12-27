module.exports = api => {
  api.onPromptComplete(options => {
    if (!options.features.includes('ts') && !options.features.includes('-babel')) {
      api.extendPackage({
        devDependencies: {
          '@vue/cli-plugin-babel': '^1.0.0',
          'babel-preset-vue-app': '^2.0.0'
        },
        babel: {
          presets: ['vue-app'] // TODO update babel-preset-vue-app
        }
      })
    }
  })
}
