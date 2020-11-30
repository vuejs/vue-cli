module.exports = (api, options, rootOptions, invoking) => {
  const isVue3 = rootOptions && rootOptions.vueVersion === '3'

  api.render('./template', {
    isVue3,
    hasTS: api.hasPlugin('typescript'),
    hasRouter: api.hasPlugin('router')
  })

  api.extendPackage({
    devDependencies: {
      '@vue/test-utils': isVue3 ? '^2.0.0-0' : '^1.1.0',
      'chai': '^4.2.0',
      'webpack': '^4.0.0'
    },
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
    }
  })

  // TODO:
  // favor "resolution" field for yarn users
  // resolutions: {
  //   '@vue/cli-*/webpack': '^4.0.0'
  // }
  // or pnpmfile.js for pnpm users

  if (isVue3) {
    api.extendPackage({
      devDependencies: {
        '@vue/server-renderer': '^3.0.0'
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
            mocha: true
          }
        }
      ]
    }
  })
}

const applyTS = module.exports.applyTS = (api, invoking) => {
  api.extendPackage({
    devDependencies: {
      '@types/mocha': '^7.0.2',
      '@types/chai': '^4.2.11'
    }
  })
  // inject mocha/chai types to tsconfig.json
  if (invoking) {
    api.render(files => {
      const tsconfig = files['tsconfig.json']
      if (tsconfig) {
        const parsed = JSON.parse(tsconfig)
        const types = parsed.compilerOptions.types
        if (types) {
          if (!types.includes('mocha')) {
            types.push('mocha')
          }
          if (!types.includes('chai')) {
            types.push('chai')
          }
        }
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2) + '\n'
      }
    })
  }
}
