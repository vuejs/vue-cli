module.exports = api => {
  api.extendPackage({
    devDependencies: {
      'babel-preset-vue-app': '^2.0.0'
    },
    babel: {
      presets: ['vue-app'] // TODO update babel-preset-vue-app
    }
  })
}
