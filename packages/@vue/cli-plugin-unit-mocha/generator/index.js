module.exports = (api, options) => {
  api.render('./template')

  const devDependencies = {
    '@vue/test-utils': '^1.0.0-beta.10',
    'chai': '^4.1.2'
  }

  api.extendPackage({
    devDependencies,
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
