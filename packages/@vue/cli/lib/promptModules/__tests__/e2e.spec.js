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
      message: 'Pick an E2E testing solution',
      choices: ['Cypress', 'Nightwatch', 'WebdriverIO'],
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
      message: 'Pick an E2E testing solution',
      choices: ['Cypress', 'Nightwatch', 'WebdriverIO'],
      choose: 1
    },
    {
      message: 'Pick browsers to run end-to-end test on',
      choice: ['Chrome', 'Firefox'],
      check: [0, 1]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-e2e-nightwatch': {
        webdrivers: ['chrome', 'firefox']
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

test('webdriverio', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['E2E Testing'],
      check: [0]
    },
    {
      message: 'Pick an E2E testing solution',
      choices: ['Cypress', 'Nightwatch', 'WebdriverIO'],
      choose: 2
    },
    {
      message: 'Pick browsers to run end-to-end test on',
      choice: ['Chrome', 'Firefox'],
      check: [0, 1]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-e2e-webdriverio': {
        webdrivers: ['chrome', 'firefox']
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
