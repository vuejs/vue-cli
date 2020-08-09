const fs = require('fs')
const path = require('path')

module.exports = (api, { config, lintOn = [] }, rootOptions, invoking) => {
  const eslintConfig = require('../eslintOptions').config(api, config, rootOptions)
  const devDependencies = require('../eslintDeps').getDeps(api, config, rootOptions)

  const pkg = {
    scripts: {
      lint: 'vue-cli-service lint'
    },
    eslintConfig,
    devDependencies
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
    const extensions = require('../eslintOptions').extensions(api)
      .map(ext => ext.replace(/^\./, ''))  // remove the leading `.`
    pkg['lint-staged'] = {
      [`*.{${extensions.join(',')}}`]: ['vue-cli-service lint', 'git add']
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
    devDependencies: require('../eslintDeps').DEPS_MAP.typescript
  })
}
