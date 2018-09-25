module.exports = (api, { config, lintOn = [] }, _, invoking) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  const eslintConfig = require('./eslintOptions').config(api)

  const pkg = {
    scripts: {
      lint: 'vue-cli-service lint'
    },
    eslintConfig,
    devDependencies: {}
  }

  if (config === 'airbnb') {
    eslintConfig.extends.push('@vue/airbnb')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-airbnb': '^3.0.4'
    })
  } else if (config === 'standard') {
    eslintConfig.extends.push('@vue/standard')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-standard': '^3.0.4'
    })
  } else if (config === 'prettier') {
    eslintConfig.extends.push('@vue/prettier')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-prettier': '^3.0.4'
    })
  } else {
    // default
    eslintConfig.extends.push('eslint:recommended')
  }

  if (!lintOn.includes('save')) {
    pkg.vue = {
      lintOnSave: false // eslint-loader configured in runtime plugin
    }
  }

  if (lintOn.includes('commit')) {
    Object.assign(pkg.devDependencies, {
      'lint-staged': '^7.2.2'
    })
    pkg.gitHooks = {
      'pre-commit': 'lint-staged'
    }
    pkg['lint-staged'] = {
      '*.js': ['vue-cli-service lint', 'git add'],
      '*.vue': ['vue-cli-service lint', 'git add']
    }
  }

  api.extendPackage(pkg)

  // typescript support
  if (api.hasPlugin('typescript')) {
    applyTS(api)
  }

  // invoking only
  if (invoking) {
    if (api.hasPlugin('unit-mocha')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-unit-mocha/generator').applyESLint(api)
    } else if (api.hasPlugin('unit-jest')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-unit-jest/generator').applyESLint(api)
    }
  }

  // lint & fix after create to ensure files adhere to chosen config
  if (config && config !== 'base') {
    api.onCreateComplete(() => {
      require('./lint')({ silent: true }, api)
    })
  }
}

const applyTS = module.exports.applyTS = api => {
  api.extendPackage({
    eslintConfig: {
      extends: ['@vue/typescript'],
      parserOptions: {
        parser: 'typescript-eslint-parser'
      }
    },
    devDependencies: {
      '@vue/eslint-config-typescript': '^3.0.4'
    }
  })
}
