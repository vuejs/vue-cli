const fs = require('fs')
const path = require('path')

module.exports = (api, { config, lintOn = [] }, _, invoking) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  const eslintConfig = require('../eslintOptions').config(api)

  const pkg = {
    scripts: {
      lint: 'vue-cli-service lint'
    },
    eslintConfig,
    devDependencies: {
      'eslint': '^5.16.0',
      'eslint-plugin-vue': '^5.0.0'
    }
  }

  if (!api.hasPlugin('typescript')) {
    pkg.devDependencies['babel-eslint'] = '^10.0.1'
  }

  if (config === 'airbnb') {
    eslintConfig.extends.push('@vue/airbnb')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-airbnb': '^4.0.0'
    })
  } else if (config === 'standard') {
    eslintConfig.extends.push('@vue/standard')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-standard': '^4.0.0'
    })
  } else if (config === 'prettier') {
    eslintConfig.extends.push('@vue/prettier')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-prettier': '^5.0.0',
      'eslint-plugin-prettier': '^3.1.0',
      prettier: '^1.18.2'
    })
    // prettier & default config do not have any style rules
    // so no need to generate an editorconfig file
  } else {
    // default
    eslintConfig.extends.push('eslint:recommended')
  }

  const editorConfigTemplatePath = path.resolve(__dirname, `./template/${config}/_editorconfig`)
  if (fs.existsSync(editorConfigTemplatePath)) {
    if (fs.existsSync(api.resolve('.editorconfig'))) {
      // Append to existing .editorconfig
      api.render(files => {
        const editorconfig = fs.readFileSync(editorConfigTemplatePath, 'utf-8')
        files['.editorconfig'] += `\n${editorconfig}`
      })
    } else {
      api.render(`./template/${config}`)
    }
  }

  if (!lintOn.includes('save')) {
    pkg.vue = {
      lintOnSave: false // eslint-loader configured in runtime plugin
    }
  }

  if (lintOn.includes('commit')) {
    Object.assign(pkg.devDependencies, {
      'lint-staged': '^8.1.5'
    })
    pkg.gitHooks = {
      'pre-commit': 'lint-staged'
    }
    if (api.hasPlugin('typescript')) {
      pkg['lint-staged'] = {
        '*.{js,vue,ts}': ['vue-cli-service lint', 'git add']
      }
    } else {
      pkg['lint-staged'] = {
        '*.{js,vue}': ['vue-cli-service lint', 'git add']
      }
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
}

const lint = require('../lint')

module.exports.hooks = (api) => {
  // lint & fix after create to ensure files adhere to chosen config
  api.afterAnyInvoke(() => {
    lint({ silent: true }, api)
  })
}

const applyTS = module.exports.applyTS = api => {
  api.extendPackage({
    eslintConfig: {
      extends: ['@vue/typescript'],
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    devDependencies: {
      '@vue/eslint-config-typescript': '^4.0.0'
    }
  })
}
