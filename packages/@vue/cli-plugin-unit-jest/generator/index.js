module.exports = (api, options) => {
  api.render('./template')
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    },
    devDependencies: {
      'vue-test-utils': '^1.0.0-beta.9'
    }
  })
}
