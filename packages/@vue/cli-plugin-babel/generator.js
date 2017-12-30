module.exports = api => {
  api.extendPackage({
    devDependencies: {
      '@vue/babel-preset-app': '^0.1.0'
    },
    babel: {
      presets: ['@vue/app']
    }
  })
}
