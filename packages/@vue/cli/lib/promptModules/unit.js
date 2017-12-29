module.exports = cli => {
  cli.injectFeature({
    name: 'Unit Testing',
    value: 'unit',
    short: 'Unit'
  })

  cli.injectPrompt({
    name: 'unit',
    when: answers => answers.features.includes('unit'),
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

  cli.injectPrompt({
    name: 'assertionLibrary',
    message: 'Pick an assertion library for unit tests:',
    when: answers => answers.unit === 'mocha',
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

  cli.onPromptComplete((answers, options) => {
    if (answers.unit === 'mocha') {
      options.plugins['@vue/cli-plugin-unit-mocha-webpack'] = {
        assertionLibrary: answers.assertionLibrary
      }
    } else if (answers.unit === 'jest') {
      options.plugins['@vue/cli-plugin-unit-jest'] = {}
    }
  })
}
