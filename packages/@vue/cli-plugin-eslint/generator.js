module.exports = (api, { config, lintOn = [] }) => {
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
      '@vue/eslint-config-airbnb': '^3.0.0-rc.3'
    })
  } else if (config === 'standard') {
    eslintConfig.extends.push('@vue/standard')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-standard': '^3.0.0-rc.3'
    })
  } else if (config === 'prettier') {
    eslintConfig.extends.push('@vue/prettier')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-prettier': '^3.0.0-rc.3'
    })
  } else {
    // default
    eslintConfig.extends.push('eslint:recommended')
  }

  // typescript support
  if (api.hasPlugin('typescript')) {
    eslintConfig.extends.push('@vue/typescript')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-typescript': '^3.0.0-rc.3'
    })
  }

  if (!lintOn.includes('save')) {
    pkg.vue = {
      lintOnSave: false // eslint-loader configured in runtime plugin
    }
  }

  if (lintOn.includes('commit')) {
    Object.assign(pkg.devDependencies, {
      'lint-staged': '^6.0.0'
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

  if (api.hasPlugin('unit-mocha')) {
    const config = {
      env: { mocha: true }
    }
    if (config === 'airbnb') {
      config.rules = {
        'import/no-extraneous-dependencies': 'off'
      }
    }
    api.render(files => {
      files['tests/unit/.eslintrc.js'] = api.genJSConfig(config)
    })
  } else if (api.hasPlugin('unit-jest')) {
    const config = {
      env: { jest: true }
    }
    if (config === 'airbnb') {
      config.rules = {
        'import/no-extraneous-dependencies': 'off'
      }
    }
    api.render(files => {
      files['tests/unit/.eslintrc.js'] = api.genJSConfig(config)
    })
  }

  // lint & fix after create to ensure files adhere to chosen config
  if (config && config !== 'base') {
    api.onCreateComplete(() => {
      require('./lint')({ silent: true }, api)
    })
  }
}
