/** @type {import('@vue/cli').GeneratorPlugin} */
module.exports = (api, options, rootOptions, invoking) => {
  const isVue3 = rootOptions && rootOptions.vueVersion === '3'

  api.render('./template', {
    isVue3,
    hasTS: api.hasPlugin('typescript'),
    hasRouter: api.hasPlugin('router')
  })

  api.extendPackage({
    devDependencies: {
      '@vue/test-utils': isVue3 ? '^2.0.0-0' : '^1.1.3',
      'chai': '^4.2.0'
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
  const devDeps = require('../package.json').devDependencies
  api.extendPackage({
    devDependencies: {
      '@types/mocha': devDeps['@types/mocha'],
      '@types/chai': devDeps['@types/chai']
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
