module.exports = (api, options) => {
  api.render('./template')
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    },
    devDependencies: {
      '@vue/test-utils': '^1.0.0-beta.10'
    }
  })

  if (api.hasPlugin('eslint')) {
    api.render(files => {
      files['test/unit/.eslintrc'] = JSON.stringify({
        env: { jest: true }
      }, null, 2)
    })
  }
}
