module.exports = (api, {
  classComponent,
  tsLint,
  lintOn = [],
  experimentalCompileTsWithBabel
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

  if (experimentalCompileTsWithBabel) {
    api.extendPackage({
      devDependencies: {
        '@babel/preset-typescript': '7 || ^7.0.0-beta || ^7.0.0-rc'
      },
      vue: {
        experimentalCompileTsWithBabel: true
      },
      babel: {
        presets: ['@babel/typescript', '@vue/app']
      }
    })

    if (classComponent) {
      api.extendPackage({
        devDependencies: {
          '@babel/plugin-proposal-decorators': '7 || ^7.0.0-beta || ^7.0.0-rc',
          '@babel/plugin-proposal-class-properties': '7 || ^7.0.0-beta || ^7.0.0-rc'
        },
        babel: {
          plugins: [
            '@babel/proposal-decorators',
            ['@babel/proposal-class-properties', { 'loose': true }]
          ]
        }
      })
    }
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

  // delete all js files that have a ts file of the same name
  // and simply rename other js files to ts
  const jsRE = /\.js$/
  const excludeRE = /^test\/e2e\/|\.config\.js$/
  const convertLintFlags = require('../lib/convertLintFlags')
  api.postProcessFiles(files => {
    for (const file in files) {
      if (jsRE.test(file) && !excludeRE.test(file)) {
        const tsFile = file.replace(jsRE, '.ts')
        if (!files[tsFile]) {
          let content = files[file]
          if (tsLint) {
            content = convertLintFlags(content)
          }
          files[tsFile] = content
        }
        delete files[file]
      }
    }
  })
}
