module.exports = api => {
  api.injectFeature({
    name: 'Unit Testing',
    value: 'unit',
    short: 'Unit'
  })

  api.injectPrompt({
    name: 'unit',
    when: options => options.features.includes('unit'),
    type: 'list',
    message: 'Pick a unit testing solution:',
    choices: [
      {
        name: 'Mocha (with better webpack integration, https://mochajs.org/)',
        value: 'mocha',
        short: 'Mocha'
      },
      {
        name: 'Jest (https://facebook.github.io/jest/)',
        value: 'jest',
        short: 'Jest'
      }
    ]
  })

  api.injectPrompt({
    name: 'assertionLibrary',
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
      require('./mocha-webpack')(api, options)
    } else if (options.unit === 'jest') {
      require('./jest')(api, options)
    }
  })
}
