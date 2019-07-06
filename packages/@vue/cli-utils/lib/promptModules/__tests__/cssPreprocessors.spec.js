jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../cssPreprocessors')

test('CSS pre-processor ', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['CSS Pre-processors'],
      check: [0]
    },
    {
      message: 'Pick a CSS pre-processor',
      choices: ['Sass/SCSS (with dart-sass)', 'Sass/SCSS (with node-sass)', 'Less', 'Stylus'],
      choose: 0
    }
  ]

  const expectedOptions = {
    cssPreprocessor: 'dart-sass',
    plugins: {}
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
