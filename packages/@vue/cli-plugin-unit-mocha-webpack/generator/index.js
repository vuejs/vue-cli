module.exports = (api, options) => {
  api.renderFiles('./files')

  const devDependencies = {
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
}
