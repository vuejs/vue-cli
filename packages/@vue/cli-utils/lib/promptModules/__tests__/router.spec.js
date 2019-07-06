jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../router')

test('router', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Router'],
      check: [0]
    },
    {
      message: 'history mode',
      confirm: true
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-router': {
        historyMode: true
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
