module.exports = (api, {
  classComponent,
  tsLint,
  lintOn = []
}) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  if (classComponent) {
    api.extendPackage({
      dependencies: {
        'vue-class-component': '^6.0.0',
        'vue-property-decorator': '^6.0.0'
      }
    })
  }

  if (tsLint) {
    api.extendPackage({
      scripts: {
        lint: 'vue-cli-service lint'
      }
    })

    if (!lintOn.includes('save')) {
      api.extendPackage({
        vue: {
          lintOnSave: false
        }
      })
    }

    if (lintOn.includes('commit')) {
      api.extendPackage({
        devDependencies: {
          'lint-staged': '^6.0.0'
        },
        gitHooks: {
          'pre-commit': 'lint-staged'
        },
        'lint-staged': {
          '*.ts': ['vue-cli-service lint', 'git add'],
          '*.vue': ['vue-cli-service lint', 'git add']
        }
      })
    }

    // lint and fix files on creation complete
    api.onCreateComplete(() => {
      return require('../lib/tslint')({}, api, true)
    })
  }

  // inject necessary typings for other plugins

  const hasMocha = api.hasPlugin('unit-mocha')
  if (hasMocha) {
    api.extendPackage({
      devDependencies: {
        '@types/mocha': '^2.2.46',
        '@types/chai': '^4.1.0'
      }
    })
  }

  const hasJest = api.hasPlugin('unit-jest')
  if (hasJest) {
    api.extendPackage({
      devDependencies: {
        '@types/jest': '^22.0.1'
      }
    })
  }

  api.render('./template', {
    isTest: process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG,
    hasMocha,
    hasJest
  })

  require('./convert')(api, { tsLint })
}
