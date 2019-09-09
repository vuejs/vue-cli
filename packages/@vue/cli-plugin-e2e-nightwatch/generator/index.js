module.exports = api => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    scripts: {
      'test:e2e': 'vue-cli-service test:e2e'
    },
    devDependencies: {
      chromedriver: '^76.0.1',
      geckodriver: '^1.16.2'
    }
  })
}
