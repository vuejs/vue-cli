jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../eslint')

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
      message: 'Pick a lint mode',
      choices: ['on save', 'on commit', 'Manually'],
      choose: 0
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'base',
        lintOn: 'save'
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
      message: 'Pick a lint mode',
      choices: ['on save', 'on commit', 'Manually'],
      choose: 1
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
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
      message: 'Pick a lint mode',
      choices: ['on save', 'on commit', 'Manually'],
      choose: 2
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'standard',
        lintOn: false
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
