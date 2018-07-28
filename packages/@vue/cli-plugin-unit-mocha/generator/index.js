module.exports = api => {
  api.render('./template')

  api.extendPackage({
    devDependencies: {
      '@vue/test-utils': '^1.0.0-beta.20',
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
    applyTS(api)
  }
}

const applyESLint = module.exports.applyESLint = api => {
  api.render(files => {
    files['tests/unit/.eslintrc.js'] = api.genJSConfig({
      env: { mocha: true },
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    })
  })
}

const applyTS = module.exports.applyTS = api => {
  // TODO inject type into tsconfig.json
  api.extendPackage({
    devDependencies: {
      '@types/mocha': '^5.2.4',
      '@types/chai': '^4.1.0'
    }
  })
}
