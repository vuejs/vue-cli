module.exports = (api, options) => {
  api.render('./template')

  api.extendPackage({
    scripts: {
      'serve': 'vue-cli-service serve',
      'build': 'vue-cli-service build'
    },
    dependencies: {
      'vue': '^2.5.17'
    },
    devDependencies: {
      'vue-template-compiler': '^2.5.17'
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

  if (options.router) {
    require('./router')(api, options)
  }

  if (options.vuex) {
    require('./vuex')(api, options)
  }

  if (options.cssPreprocessor) {
    const deps = {
      sass: {
        'node-sass': '^4.9.0',
        'sass-loader': '^7.0.1'
      },
      less: {
        'less': '^3.0.4',
        'less-loader': '^4.1.0'
      },
      stylus: {
        'stylus': '^0.54.5',
        'stylus-loader': '^3.0.2'
      }
    }

    api.extendPackage({
      devDependencies: deps[options.cssPreprocessor]
    })
  }

  // additional tooling configurations
  if (options.configs) {
    api.extendPackage(options.configs)
  }
}
