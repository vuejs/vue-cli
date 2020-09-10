module.exports = (api, options) => {
  api.render('./template', {
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript')
  })

  if (options.vueVersion === '3') {
    api.extendPackage({
      dependencies: {
        'vue': '^3.0.0-0'
      },
      devDependencies: {
        '@vue/compiler-sfc': '^3.0.0-0'
      }
    })
  } else {
    api.extendPackage({
      dependencies: {
        'vue': '^2.6.11'
      },
      devDependencies: {
        'vue-template-compiler': '^2.6.11'
      }
    })
  }

  api.extendPackage({
    scripts: {
      'serve': 'vue-cli-service serve',
      'build': 'vue-cli-service build'
    },
    browserslist: [
      '> 1%',
      'last 2 versions',
      'not dead'
    ]
  })

  if (options.cssPreprocessor) {
    const deps = {
      sass: {
        sass: '^1.26.5',
        'sass-loader': '^8.0.2'
      },
      'node-sass': {
        'node-sass': '^4.12.0',
        'sass-loader': '^8.0.2'
      },
      'dart-sass': {
        sass: '^1.26.5',
        'sass-loader': '^8.0.2'
      },
      less: {
        'less': '^3.0.4',
        'less-loader': '^5.0.0'
      },
      stylus: {
        'stylus': '^0.54.7',
        'stylus-loader': '^3.0.2'
      }
    }

    api.extendPackage({
      devDependencies: deps[options.cssPreprocessor]
    })
  }

  // for v3 compatibility
  if (options.router && !api.hasPlugin('router')) {
    require('./router')(api, options, options)
  }

  // for v3 compatibility
  if (options.vuex && !api.hasPlugin('vuex')) {
    require('./vuex')(api, options, options)
  }

  // additional tooling configurations
  if (options.configs) {
    api.extendPackage(options.configs)
  }
}
