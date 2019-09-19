module.exports = (api, _, __, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  let jestPresetPath
  if (api.hasPlugin('babel')) {
    if (api.hasPlugin('typescript')) {
      jestPresetPath = '@vue/cli-plugin-unit-jest/preset/typescript-and-babel'
    } else {
      jestPresetPath = '@vue/cli-plugin-unit-jest/preset'
    }
  } else {
    if (api.hasPlugin('typescript')) {
      jestPresetPath = '@vue/cli-plugin-unit-jest/preset/typescript'
    } else {
      jestPresetPath = '@vue/cli-plugin-unit-jest/preset/no-babel'
    }
  }

  api.extendPackage({
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
    },
    devDependencies: {
      '@vue/test-utils': '1.0.0-beta.29'
    },
    jest: {
      preset: jestPresetPath
    }
  })

  if (api.hasPlugin('eslint')) {
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

  // inject jest type to tsconfig.json
  if (api.hasPlugin('typescript') && invoking) {
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
}
