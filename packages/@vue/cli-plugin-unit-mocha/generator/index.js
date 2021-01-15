/** @type {import('@vue/cli').GeneratorPlugin} */
module.exports = (api, options, rootOptions, invoking) => {
  const isVue3 = rootOptions && rootOptions.vueVersion === '3'

  api.render('./template', {
    isVue3,
    hasTS: api.hasPlugin('typescript'),
    hasRouter: api.hasPlugin('router')
  })

  const { semver } = require('@vue/cli-shared-utils')
  const cliServiceVersion = require('@vue/cli-service/package.json').version
  if (semver.gte(cliServiceVersion, '5.0.0-0')) {
    // mochapack currently does not support webpack 5 yet
    require('@vue/cli-plugin-webpack-4/generator')(api, {}, rootOptions, invoking)
  }

  api.extendPackage({
    devDependencies: {
      '@vue/cli-plugin-webpack-4': require('../package.json').dependencies['@vue/cli-plugin-webpack-4'],
      '@vue/test-utils': isVue3 ? '^2.0.0-0' : '^1.1.0',
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
  api.extendPackage({
    devDependencies: {
      '@types/mocha': '^8.0.4',
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
