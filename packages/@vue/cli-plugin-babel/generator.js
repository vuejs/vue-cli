module.exports = api => {
  api.extendPackage({
    devDependencies: {
      '@vue/babel-preset-app': '^3.0.0-alpha.1'
    },
    babel: {
      presets: ['@vue/app']
    }
  })
}
