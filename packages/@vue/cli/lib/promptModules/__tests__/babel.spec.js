jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../babel')

it('should pass', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      check: []
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-babel': {}
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { plguinsOnly: true }
  )
})

it('should not include the plugin if ts is also present', async () => {
  const mockTSModule = api => {
    api.onPromptComplete(answers => {
      answers.features.push('ts')
    })
  }

  const expectedPrompts = [
    {
      message: 'features',
      check: []
    }
  ]

  const expectedOptions = {
    plugins: {}
  }

  await assertPromptModule(
    [mockTSModule, moduleToTest],
    expectedPrompts,
    expectedOptions,
    { plguinsOnly: true }
  )
})
