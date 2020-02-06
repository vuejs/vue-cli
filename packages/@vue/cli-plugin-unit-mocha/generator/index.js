module.exports = (api, _, __, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    devDependencies: {
      '@vue/test-utils': '1.0.0-beta.31',
      'chai': '^4.1.2'
    },
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
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
      '@types/mocha': '^5.2.4',
      '@types/chai': '^4.2.8'
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
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2)
      }
    })
  }
}
