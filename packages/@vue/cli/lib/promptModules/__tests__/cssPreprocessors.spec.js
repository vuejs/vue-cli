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
      choices: ['SASS', 'LESS', 'Stylus'],
      choose: 0
    }
  ]

  const expectedOptions = {
    cssPreprocessor: 'sass',
    plugins: {}
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
