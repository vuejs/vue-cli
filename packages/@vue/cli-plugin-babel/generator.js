module.exports = api => {
  api.extendPackage({
    devDependencies: {
      '@vue/babel-preset-app': '^3.0.0-alpha.2'
    },
    babel: {
      presets: ['@vue/app']
    }
  })
}
