module.exports = api => {
  api.injectOptionForFeature('unit', {
    name: 'Mocha (with better webpack integration, https://mochajs.org/)',
    value: 'mocha',
    short: 'Mocha'
  })

  api.injectPrompt({
    name: 'mochaAssertionLibrary',
    message: 'Pick an assertion library for unit tests:',
    when: options => options.unit === 'mocha',
    type: 'list',
    choices: [
      {
        name: 'Chai (http://chaijs.com/)',
        value: 'chai',
        short: 'Chai'
      },
      {
        name: 'Expect (https://facebook.github.io/jest/docs/en/expect.html)',
        value: 'expect',
        short: 'Expect'
      },
      {
        name: `I'll pick my own`,
        value: 'custom',
        short: 'Custom'
      }
    ]
  })

  api.onPromptComplete(options => {
    if (options.unit === 'mocha') {
      const dependencies = {
        '@vue/api-plugin-unit-mocha-webpack': '^1.0.0'
        'vue-test-utils': '^1.0.0'
      }
      if (options.mochaAssertionLibrary === 'chai') {
        dependencies.chai = '*'
      } else if (options.mochaAssertionLibrary === 'expect') {
        dependencies.expect = '*'
      }
      api.injectDependencies(dependencies)

      api.injectScripts({
        test: 'vue-api-service test'
      })

      api.injectFileMiddleware(files => {
        // add dummy test
        files['test/unit/Hello.spec.js'] = api.renderFile('./files/Hello.spec.js')
      })
    }
  })
}
