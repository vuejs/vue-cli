jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

const moduleToTest = require('../typescript')
const linterModule = require('../linter')

test('should work', async () => {
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
      message: 'Pick additional lint features',
      choices: ['on save', 'on commit'],
      check: [0, 1]
    }
  ]

  const expectedOptions = {
    plugins: {
      '@vue/cli-plugin-typescript': {
        classComponent: true,
        lint: true,
        lintOn: ['save', 'commit']
      }
    }
  }

  await assertPromptModule(
    [moduleToTest, linterModule],
    expectedPrompts,
    expectedOptions,
    { plguinsOnly: true }
  )
})
