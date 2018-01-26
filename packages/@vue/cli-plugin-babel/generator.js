module.exports = api => {
  api.extendPackage({
    babel: {
      presets: ['@vue/app']
    }
  })
}
