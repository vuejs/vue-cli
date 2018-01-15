module.exports = (api, { config, lintOn = [] }) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  const pkg = {
    scripts: {
      lint: 'vue-cli-service lint'
    },
    eslintConfig: {
      extends: ['plugin:vue/essential']
    },
    devDependencies: {
      'eslint-plugin-vue': '^4.2.0'
    }
  }

  if (config === 'airbnb') {
    pkg.eslintConfig.extends.push('@vue/airbnb')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-airbnb': '^3.0.0-alpha.1'
    })
  } else if (config === 'standard') {
    pkg.eslintConfig.extends.push('@vue/standard')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-standard': '^3.0.0-alpha.1'
    })
  } else if (config === 'prettier') {
    // TODO
  } else {
    // default
    pkg.eslintConfig.extends.push('eslint:recommended')
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
      require('./lint')(api.resolve('.'), { silent: true })
    })
  }
}
