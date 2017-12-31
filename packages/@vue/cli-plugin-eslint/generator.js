module.exports = (api, { config, lintOnSave, lintOnCommit }) => {
  const pkg = {
    scripts: {
      lint: 'eslint src --ext .js,.vue --format codeframe --fix'
    },
    eslintConfig: {
      extends: ['plugin:vue/essential'],
      parserOptions: {
        parser: 'babel-eslint'
      }
    },
    devDependencies: {
      'eslint': '^4.14.0',
      'babel-eslint': '^8.1.2',
      'eslint-plugin-vue': '4 || ^4.0.0-beta || ^4.0.0-rc'
    }
  }

  if (config === 'airbnb') {
    pkg.eslintConfig.extends.unshift('airbnb-base')
    Object.assign(pkg.devDependencies, {
      'eslint-config-airbnb-base': '^11.3.0',
      'eslint-import-resolver-webpack': '^0.8.3',
      'eslint-plugin-import': '^2.7.0'
    })
  } else if (config === 'standard') {
    pkg.eslintConfig.extends.unshift('standard')
    Object.assign(pkg.devDependencies, {
      'eslint-config-standard': '^10.2.1',
      'eslint-plugin-promise': '^3.4.0',
      'eslint-plugin-standard': '^3.0.1',
      'eslint-plugin-import': '^2.7.0',
      'eslint-plugin-node': '^5.2.0'
    })
  } else if (config === 'prettier') {
    // TODO
  }

  if (lintOnSave) {
    pkg.vue = {
      lintOnSave: true // eslint-loader configured in runtime plugin
    }
  }

  if (lintOnCommit) {
    Object.assign(pkg.devDependencies, {
      'husky': '^0.14.3',
      'lint-staged': '^6.0.0'
    })
    pkg['lint-staged'] = {
      '*.js': ['eslint --fix --format codeframe', 'git add'],
      '*.vue': ['eslint --fix --format codeframe', 'git add']
    }
  }

  api.extendPackage(pkg)

  api.onCreateComplete(() => {
    // run fix after creation
  })
}
