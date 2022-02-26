module.exports = api => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript'),
    hasESLint: api.hasPlugin('eslint')
  })

  api.extendPackage({
    devDependencies: {
      cypress: require('../package.json').devDependencies.cypress
    },
    scripts: {
      'test:e2e': 'vue-cli-service test:e2e'
    }
  })
}
