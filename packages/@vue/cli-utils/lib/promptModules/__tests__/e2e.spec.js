jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../e2e')

test('cypress', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['E2E Testing'],
      check: [0]
    },
    {
      message: 'Pick a E2E testing solution',
      choices: ['Cypress', 'Nightwatch'],
      choose: 0
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-e2e-cypress': {}
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})

test('nightwatch', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['E2E Testing'],
      check: [0]
    },
    {
      message: 'Pick a E2E testing solution',
      choices: ['Cypress', 'Nightwatch'],
      choose: 1
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-e2e-nightwatch': {}
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
