module.exports = (api, options) => {
  const devDependencies = {
    '@vue/cli-plugin-unit-mocha-webpack': '^1.0.0',
    'vue-test-utils': '^1.0.0'
  }
  if (options.assertionLibrary === 'chai') {
    devDependencies.chai = '^4.1.2'
  } else if (options.assertionLibrary === 'expect') {
    devDependencies.expect = '^22.0.3'
  }

  api.extendPackage({
    devDependencies,
    scripts: {
      test: 'vue-cli-service test'
    }
  })

  api.injectFileMiddleware(files => {
    // add dummy test
    files['test/unit/Hello.spec.js'] = api.renderFile('Hello.spec.js')
  })
}
