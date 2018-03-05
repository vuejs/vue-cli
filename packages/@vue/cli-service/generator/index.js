module.exports = (api, options) => {
  api.render('./template')

  api.extendPackage({
    scripts: {
      'serve': 'vue-cli-service serve' + (
        // only auto open browser on MacOS where applescript
        // can avoid dupilcate window opens
        process.platform === 'darwin'
          ? ' --open'
          : ''
      ),
      'build': 'vue-cli-service build'
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

  if (options.router) {
    api.extendPackage({
      dependencies: {
        'vue-router': '^3.0.1'
      }
    })
  }

  if (options.vuex) {
    api.extendPackage({
      dependencies: {
        vuex: '^3.0.1'
      }
    })
  }

  if (options.cssPreprocessor) {
    const deps = {
      sass: {
        'node-sass': '^4.7.2',
        'sass-loader': '^6.0.6'
      },
      less: {
        'less': '^2.7.3',
        'less-loader': '^4.0.5'
      },
      stylus: {
        'stylus': '^0.54.5',
        'stylus-loader': '^3.0.1'
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
