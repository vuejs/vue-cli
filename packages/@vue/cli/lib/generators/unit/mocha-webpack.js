module.exports = (api, options) => {
  const dependencies = {
    '@vue/cli-plugin-unit-mocha-webpack': '^1.0.0',
    'vue-test-utils': '^1.0.0'
  }
  if (options.assertionLibrary === 'chai') {
    dependencies.chai = '^4.1.2'
  } else if (options.assertionLibrary === 'expect') {
    dependencies.expect = '^22.0.3'
  }
  api.injectDevDeps(dependencies)

  api.injectScripts({
    test: 'vue-cli-service test'
  })

  api.injectFileMiddleware(files => {
    // add dummy test
    files['test/unit/Hello.spec.js'] = api.renderFile('Hello.spec.js')
  })
}
