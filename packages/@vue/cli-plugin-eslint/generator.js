module.exports = (api, { config, lintOn = [] }) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  const pkg = {
    scripts: {
      lint: 'vue-cli-service lint'
    },
    eslintConfig: {
      root: true,
      extends: ['plugin:vue/essential']
    },
    devDependencies: {}
  }

  if (config === 'airbnb') {
    pkg.eslintConfig.extends.push('@vue/airbnb')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-airbnb': '^3.0.0-alpha.10'
    })
  } else if (config === 'standard') {
    pkg.eslintConfig.extends.push('@vue/standard')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-standard': '^3.0.0-alpha.10'
    })
  } else if (config === 'prettier') {
    pkg.eslintConfig.extends.push('@vue/prettier')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-prettier': '^3.0.0-alpha.10'
    })
  } else {
    // default
    pkg.eslintConfig.extends.push('eslint:recommended')
  }

  // typescript support
  if (api.hasPlugin('typescript')) {
    pkg.eslintConfig.extends.push('@vue/typescript')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-typescript': '^3.0.0-alpha.10'
    })
  }

  if (lintOn.includes('save')) {
    pkg.vue = {
      lintOnSave: true // eslint-loader configured in runtime plugin
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
    api.render(files => {
      files['test/unit/.eslintrc'] = JSON.stringify({
        env: { mocha: true }
      }, null, 2)
    })
  } else if (api.hasPlugin('unit-jest')) {
    api.render(files => {
      files['test/unit/.eslintrc'] = JSON.stringify({
        env: { jest: true }
      }, null, 2)
    })
  }

  // lint & fix after create to ensure files adhere to chosen config
  if (config && config !== 'base') {
    api.onCreateComplete(() => {
      require('./lint')({ silent: true }, api)
    })
  }
}
