module.exports = api => {
  api.onPromptComplete(options => {
    if (!options.features.includes('-core')) {
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
          '@vue/cli-service': '^0.1.0',
          'vue-template-compiler': '^2.5.13'
        },
        'postcss': {
          'plugins': {
            'autoprefixer': {}
          }
        },
        browserslist: [
          '> 1%',
          'last 2 versions',
          'not ie <= 8'
        ]
      })
    }
  })
}
