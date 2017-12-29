module.exports = (generatorAPI, options) => {
  generatorAPI.render('./template')
  generatorAPI.extendPackage({
    scripts: {
      'dev': 'vue-cli-service serve' + (
        // only auto open browser on MacOS where applescript
        // can avoid dupilcate window opens
        process.platform === 'darwin'
          ? ' --open'
          : ''
      ),
      'build': 'vue-cli-service build',
      'start': 'vue-cli-service serve --prod'
    },
    dependencies: {
      'vue': '^2.5.13'
    },
    devDependencies: {
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
