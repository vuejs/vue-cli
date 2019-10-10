module.exports = (api, options) => {
  api.render('./template', {
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript')
  })

  api.extendPackage({
    scripts: {
      'serve': 'vue-cli-service serve',
      'build': 'vue-cli-service build'
    },
    dependencies: {
      'vue': '^2.6.10'
    },
    devDependencies: {
      'vue-template-compiler': '^2.6.10'
    },
    'postcss': {
      'plugins': {
        'autoprefixer': {}
      }
    },
    browserslist: [
      '> 1%',
      'last 2 versions'
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
      // TODO: remove 'sass' option in v4 or rename 'dart-sass' to 'sass'
      sass: {
        'node-sass': '^4.12.0',
        'sass-loader': '^8.0.0'
      },
      'node-sass': {
        'node-sass': '^4.12.0',
        'sass-loader': '^8.0.0'
      },
      'dart-sass': {
        sass: '^1.19.0',
        'sass-loader': '^8.0.0'
      },
      less: {
        'less': '^3.0.4',
        'less-loader': '^5.0.0'
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
