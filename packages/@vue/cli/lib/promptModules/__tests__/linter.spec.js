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
      message: 'Pick a linter / formatter config',
      choices: ['error prevention only', 'Airbnb', 'Standard', 'Prettier'],
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
    { pluginsOnly: true }
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
      choose: 1
    },
    {
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
    { pluginsOnly: true }
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
      choose: 2
    },
    {
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
    { pluginsOnly: true }
  )
})

test('prettier', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      choose: 3
    },
    {
      check: [0]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'prettier',
        lintOn: ['save']
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
