const pluginDevDeps = require('../package.json').devDependencies

module.exports = (
  api,
  { classComponent, skipLibCheck = true, convertJsToTs, allowJs },
  rootOptions,
  invoking
) => {
  const isVue3 = rootOptions && rootOptions.vueVersion === '3'

  api.extendPackage({
    devDependencies: {
      typescript: pluginDevDeps.typescript
    }
  })

  if (classComponent) {
    if (isVue3) {
      api.extendPackage({
        dependencies: {
          'vue-class-component': '^8.0.0-0'
        }
      })
    } else {
      api.extendPackage({
        dependencies: {
          'vue-class-component': pluginDevDeps['vue-class-component'],
          'vue-property-decorator': pluginDevDeps['vue-property-decorator']
        }
      })
    }
  }

  // late invoke compat
  if (invoking) {
    if (api.hasPlugin('unit-mocha')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-unit-mocha/generator').applyTS(api)
    }

    if (api.hasPlugin('unit-jest')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-unit-jest/generator').applyTS(api)
    }

    if (api.hasPlugin('eslint')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-eslint/generator').applyTS(api)
    }

    if (api.hasPlugin('e2e-webdriverio')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('@vue/cli-plugin-e2e-webdriverio/generator').applyTS(api)
    }
  }

  api.render('./template', {
    skipLibCheck,
    hasMocha: api.hasPlugin('unit-mocha'),
    hasJest: api.hasPlugin('unit-jest'),
    hasWebDriverIO: api.hasPlugin('e2e-webdriverio')
  })

  if (isVue3) {
    api.render('./template-vue3')

    // In Vue 3, TSX interface is defined in https://github.com/vuejs/vue-next/blob/master/packages/runtime-dom/types/jsx.d.ts
    // So no need to manually add a shim.
    api.render((files) => delete files['src/shims-tsx.d.ts'])
  }

  require('./convert')(api, { convertJsToTs })
}

module.exports.after = '@vue/cli-plugin-router'
