module.exports = (api, {
  classComponent,
  lint,
  lintOn = [],
  experimentalCompileTsWithBabel
}) => {
  if (classComponent) {
    api.extendPackage({
      devDependencies: {
        'vue-class-component': '^6.0.0',
        'vue-property-decorator': '^6.0.0'
      }
    })
  }

  if (lint) {
    api.extendPackage({
      scripts: {
        lint: 'vue-cli-service lint'
      },
      vue: {
        lintOnSave: lintOn.includes('save')
      }
    })

    if (lintOn.includes('commit')) {
      api.extendPackage({
        devDependencies: {
          'lint-staged': '^6.0.0'
        },
        gitHooks: {
          'pre-commit': 'lint-staged'
        },
        'lint-staged': {
          '*.js': ['vue-cli-service lint', 'git add'],
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

  const hasMocha = api.hasPlugin('@vue/cli-plugin-unit-mocha')
  if (hasMocha) {
    api.extendPackage({
      devDependencies: {
        '@types/mocha': '^2.2.46',
        '@types/chai': '^4.1.0'
      }
    })
  }

  const hasJest = api.hasPlugin('@vue/cli-plugin-unit-jest')
  if (hasJest) {
    api.extendPackage({
      devDependencies: {
        '@types/jest': '^22.0.1'
      }
    })
  }

  // TODO cater to e2e test plugins

  api.render('./template', {
    hasJest,
    hasMocha
  })

  // delete all js files that have a ts file of the same name
  // and simply rename other js files to ts
  const jsRE = /\.js$/
  const convertLintFlags = require('../lib/convertLintFlags')
  api.postProcessFiles(files => {
    for (const file in files) {
      if (jsRE.test(file)) {
        const tsFile = file.replace(jsRE, '.ts')
        if (!files[tsFile]) {
          files[tsFile] = convertLintFlags(files[file])
        }
        delete files[file]
      }
    }
  })

  if (experimentalCompileTsWithBabel) {
    api.extendPackage({
      devDependencies: {
        'babel-loader': '8 || ^8.0.0-beta || ^8.0.0-rc',
        '@babel/core': '7 || ^7.0.0-beta || ^7.0.0-rc',
        '@babel/preset-typescript': '7 || ^7.0.0-beta || ^7.0.0-rc',
        '@vue/babel-preset-app': '^3.0.0-alpha.1'
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
}
