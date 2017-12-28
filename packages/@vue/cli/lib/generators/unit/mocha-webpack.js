module.exports = (api, options) => {
  const devDependencies = {
    '@vue/cli-plugin-unit-mocha-webpack': '^0.1.0',
    'vue-test-utils': '^1.0.0-beta.9'
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

  api.renderFiles('./files')
}
