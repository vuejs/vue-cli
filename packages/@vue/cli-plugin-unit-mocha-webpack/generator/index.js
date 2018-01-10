module.exports = (api, options) => {
  api.render('./template')

  const dependencies = {
    '@vue/test-utils': '^1.0.0-beta.10'
  }
  if (options.assertionLibrary === 'chai') {
    dependencies.chai = '^4.1.2'
  } else if (options.assertionLibrary === 'expect') {
    dependencies.expect = '^22.0.3'
  }

  api.extendPackage({
    dependencies,
    scripts: {
      test: 'vue-cli-service test'
    }
  })

  if (api.hasPlugin('eslint')) {
    api.render(files => {
      files['test/unit/.eslintrc'] = JSON.stringify({
        env: { mocha: true }
      }, null, 2)
    })
  }
}
