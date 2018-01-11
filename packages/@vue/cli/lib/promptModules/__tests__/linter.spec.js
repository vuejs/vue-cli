jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../linter')

test('base', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      message: 'Pick a lint config',
      choices: ['error prevention only', 'Airbnb', 'Standard'],
      choose: 0
    },
    {
      message: 'Pick additional lint features',
      choices: ['on save', 'on commit'],
      check: [0, 1]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'base',
        lintOn: ['save', 'commit']
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { plguinsOnly: true }
  )
})

test('airbnb', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      message: 'Pick a lint config',
      choices: ['error prevention only', 'Airbnb', 'Standard'],
      choose: 1
    },
    {
      choices: ['on save', 'on commit'],
      check: [1]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: ['commit']
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { plguinsOnly: true }
  )
})

test('standard', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      message: 'Pick a lint config',
      choices: ['error prevention only', 'Airbnb', 'Standard'],
      choose: 2
    },
    {
      choices: ['on save', 'on commit'],
      check: []
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'standard',
        lintOn: []
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { plguinsOnly: true }
  )
})
