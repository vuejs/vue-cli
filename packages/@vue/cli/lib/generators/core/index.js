module.exports = api => {
  api.renderFiles('./files')
  api.extendPackage({
    scripts: {
      'dev': 'vue-cli-service serve',
      'build': 'vue-cli-service build',
      'start': 'vue-cli-service serve --prod'
    },
    dependencies: {
      'vue': '^2.5.13'
    },
    devDependencies: {
      '@vue/cli-service': '^1.0.0'
    }
  })
}
