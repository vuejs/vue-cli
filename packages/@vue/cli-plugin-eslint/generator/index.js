const fs = require('fs')
const path = require('path')

module.exports = (api, { config, lintOn = [] }, _, invoking) => {
  const eslintConfig = require('../eslintOptions').config(api)
  const extentions = require('../eslintOptions').extensions(api)
    .map(ext => ext.replace(/^\./, ''))  // remove the leading `.`

  const pkg = {
    scripts: {
      lint: 'vue-cli-service lint'
    },
    eslintConfig,
    devDependencies: {
      eslint: '^6.7.2',
      'eslint-plugin-vue': '^6.1.2'
    }
  }

  if (api.hasPlugin('babel') && !api.hasPlugin('typescript')) {
    pkg.devDependencies['babel-eslint'] = '^10.0.3'
  }

  switch (config) {
  case 'airbnb':
    eslintConfig.extends.push('@vue/airbnb')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-airbnb': '^5.0.1',
      'eslint-plugin-import': '^2.18.2'
    })
    break
  case 'standard':
    eslintConfig.extends.push('@vue/standard')
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-standard': '^5.1.0',
      'eslint-plugin-import': '^2.18.2',
      'eslint-plugin-node': '^9.1.0',
      'eslint-plugin-promise': '^4.2.1',
      'eslint-plugin-standard': '^4.0.0'
    })
    break
  case 'prettier':
    eslintConfig.extends.push(
      ...(api.hasPlugin('typescript')
        ? ['eslint:recommended', '@vue/typescript/recommended', '@vue/prettier', '@vue/prettier/@typescript-eslint']
        : ['eslint:recommended', '@vue/prettier']
      )
    )
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-prettier': '^6.0.0',
      'eslint-plugin-prettier': '^3.1.1',
      prettier: '^1.19.1'
    })
    break
  default:
    // default
    eslintConfig.extends.push('eslint:recommended')
    break
  }

  // typescript support
  if (api.hasPlugin('typescript')) {
    Object.assign(pkg.devDependencies, {
      '@vue/eslint-config-typescript': '^5.0.1',
      '@typescript-eslint/eslint-plugin': '^2.10.0',
      '@typescript-eslint/parser': '^2.10.0'
    })
    if (config !== 'prettier') {
      // for any config other than `prettier`,
      // typescript ruleset should be appended to the end of the `extends` array
      eslintConfig.extends.push('@vue/typescript/recommended')
    }
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

  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  if (!lintOn.includes('save')) {
    pkg.vue = {
      lintOnSave: false // eslint-loader configured in runtime plugin
    }
  }

  if (lintOn.includes('commit')) {
    Object.assign(pkg.devDependencies, {
      'lint-staged': '^9.5.0'
    })
    pkg.gitHooks = {
      'pre-commit': 'lint-staged'
    }
    pkg['lint-staged'] = {
      [`*.{${extentions.join(',')}}`]: ['vue-cli-service lint', 'git add']
    }
  }

  api.extendPackage(pkg)

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
  // for older versions that do not support the `hooks` feature
  try {
    api.assertCliVersion('^4.0.0-beta.0')
  } catch (e) {
    if (config && config !== 'base') {
      api.onCreateComplete(() => {
        require('../lint')({ silent: true }, api)
      })
    }
  }
}

// In PNPM v4, due to their implementation of the module resolution mechanism,
// put require('../lint') in the callback would raise a "Module not found" error,
// But we cannot cache the file outside the callback,
// because the node_module layout may change after the "intall additional dependencies"
// phase, thus making the cached module fail to execute.
// FIXME: at the moment we have to catch the bug and silently fail. Need to fix later.
module.exports.hooks = (api) => {
  // lint & fix after create to ensure files adhere to chosen config
  api.afterAnyInvoke(() => {
    try {
      require('../lint')({ silent: true }, api)
    } catch (e) {}
  })
}

// exposed for the typescript plugin
module.exports.applyTS = api => {
  api.extendPackage({
    eslintConfig: {
      extends: ['@vue/typescript'],
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    devDependencies: {
      '@vue/eslint-config-typescript': '^5.0.1',
      '@typescript-eslint/eslint-plugin': '^2.7.0',
      '@typescript-eslint/parser': '^2.7.0'
    }
  })
}
