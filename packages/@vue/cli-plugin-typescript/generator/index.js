module.exports = (api, {
  classComponent,
  tsLint,
  lintOn = []
}, _, invoking) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  api.extendPackage({
    devDependencies: {
      typescript: '^3.4.3'
    }
  })

  if (classComponent) {
    api.extendPackage({
      dependencies: {
        'vue-class-component': '^7.0.2',
        'vue-property-decorator': '^8.1.0'
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
          'lint-staged': '^8.1.5'
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

  // late invoke compat
  if (invoking) {
    if (api.hasPlugin('unit-mocha')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-unit-mocha/generator').applyTS(api)
    }

    if (api.hasPlugin('unit-jest')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-unit-jest/generator').applyTS(api)
    }

    if (api.hasPlugin('eslint')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-eslint/generator').applyTS(api)
    }
  }

  api.render('./template', {
    isTest: process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG,
    hasMocha: api.hasPlugin('unit-mocha'),
    hasJest: api.hasPlugin('unit-jest')
  })

  require('./convert')(api, { tsLint })
}
