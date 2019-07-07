jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../pwa')

test('pwa', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['PWA'],
      check: [0]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-pwa': {}
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
