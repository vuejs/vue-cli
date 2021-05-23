module.exports = (api, options, rootOptions, invoking) => {
  const isVue3 = rootOptions && rootOptions.vueVersion === '3'

  api.render('./template', {
    isVue3,
    hasTS: api.hasPlugin('typescript'),
    hasRouter: api.hasPlugin('router')
  })

  api.extendPackage({
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
    },
    devDependencies: {
      'vue-jest': isVue3 ? '^5.0.0-0' : '^4.0.1',
      '@vue/test-utils': isVue3 ? '^2.0.0-0' : '^1.1.3'
    },
    jest: {
      preset: api.hasPlugin('babel')
        ? '@vue/cli-plugin-unit-jest'
        : '@vue/cli-plugin-unit-jest/presets/no-babel'
    }
  })

  if (api.hasPlugin('eslint')) {
    applyESLint(api)
  }

  if (api.hasPlugin('typescript')) {
    applyTS(api, invoking)
  }
}

const applyESLint = module.exports.applyESLint = api => {
  api.extendPackage({
    eslintConfig: {
      overrides: [
        {
          files: [
            '**/__tests__/*.{j,t}s?(x)',
            '**/tests/unit/**/*.spec.{j,t}s?(x)'
          ],
          env: {
            jest: true
          }
        }
      ]
    }
  })
}

const applyTS = (module.exports.applyTS = (api, invoking) => {
  api.extendPackage({
    jest: {
      preset: api.hasPlugin('babel')
        ? '@vue/cli-plugin-unit-jest/presets/typescript-and-babel'
        : '@vue/cli-plugin-unit-jest/presets/typescript'
    },
    devDependencies: {
      '@types/jest': '^26.0.20',
      'ts-jest': '^26.5.3'
    }
  })

  if (invoking) {
    // inject jest type to tsconfig.json
    api.render(files => {
      const tsconfig = files['tsconfig.json']
      if (tsconfig) {
        const parsed = JSON.parse(tsconfig)
        if (
          parsed.compilerOptions.types &&
          !parsed.compilerOptions.types.includes('jest')
        ) {
          parsed.compilerOptions.types.push('jest')
        }
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2) + '\n'
      }
    })
  }
})
