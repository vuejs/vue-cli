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
      '@vue/test-utils': isVue3 ? '^2.0.0-0' : '^1.0.3'
    },
    jest: {
      preset: api.hasPlugin('babel')
        ? '@vue/cli-plugin-unit-jest'
        : '@vue/cli-plugin-unit-jest/presets/no-babel'
    }
  })

  if (isVue3) {
    api.extendPackage({
      devDependencies: {
        'vue-jest': '^5.0.0-0',
        // vue-jest 5.0.0-alpha.1 requires typescript to be present
        'typescript': '~3.9.3'
      },
      jest: {
        transform: {
          '^.+\\.vue$': 'vue-jest'
        }
      }
    })
  }

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
      '@types/jest': '^24.0.19'
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
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2)
      }
    })
  }
})
