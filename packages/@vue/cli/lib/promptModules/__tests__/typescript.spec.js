jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../typescript')
const linterModule = require('../linter')

test('with TSLint', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['TypeScript', 'Linter'],
      check: [0, 1]
    },
    {
      message: 'Use class-style component',
      confirm: true
    },
    {
      message: 'Use Babel',
      confirm: true
    },
    {
      message: 'Pick a linter / formatter',
      choices: ['ESLint with error prevention only', 'Airbnb', 'Standard', 'Prettier', 'TSLint (deprecated)'],
      choose: [4]
    },
    {
      message: 'Pick additional lint features',
      choices: ['on save', 'on commit'],
      check: [0, 1]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-typescript': {
        classComponent: true,
        tsLint: true,
        lintOn: ['save', 'commit'],
        useTsWithBabel: true
      }
    }
  }

  await assertPromptModule(
    [moduleToTest, linterModule],
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})

test('with ESLint', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['TypeScript', 'Linter'],
      check: [0, 1]
    },
    {
      message: 'Use class-style component',
      confirm: true
    },
    {
      message: 'Use Babel',
      confirm: true
    },
    {
      message: 'Pick a linter / formatter',
      choices: ['ESLint with error prevention only', 'Airbnb', 'Standard', 'Prettier', 'TSLint (deprecated)'],
      choose: [1]
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
        config: 'airbnb',
        lintOn: ['save', 'commit']
      },
      '@vue/cli-plugin-typescript': {
        classComponent: true,
        useTsWithBabel: true
      }
    }
  }

  await assertPromptModule(
    [moduleToTest, linterModule],
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
