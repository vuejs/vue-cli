module.exports = (api, _, __, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
    },
    devDependencies: {
      '@vue/test-utils': '1.0.0-beta.31'
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
