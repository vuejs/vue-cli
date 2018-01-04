jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../unit')

it('mocha', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Unit Testing'],
      check: [0]
    },
    {
      message: 'Pick a unit testing solution',
      choices: ['Mocha', 'Jest'],
      choose: 0
    },
    {
      message: 'Pick an assertion library',
      choices: ['Chai', 'Expect', 'pick my own'],
      choose: 0
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-unit-mocha-webpack': {
        assertionLibrary: 'chai'
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

it('jest', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Unit Testing'],
      check: [0]
    },
    {
      message: 'Pick a unit testing solution',
      choices: ['Mocha', 'Jest'],
      choose: 1
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-unit-jest': {}
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { plguinsOnly: true }
  )
})
