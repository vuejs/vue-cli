jest.mock('fs')
jest.mock('inquirer')

const { defaults } = require('../options')
const assertPromptModule = require('@vue/cli-test-utils/assertPromptModule')

it('default', async () => {
  const epxectedPrompts = [
    {
      message: 'project creation mode',
      choices: [
        'Zero-config',
        'Manually select'
      ],
      choose: 0
    }
  ]
  assertPromptModule([], epxectedPrompts, defaults)
})

it('manual + PromptModuleAPI', async () => {
  const mockModule = api => {
    api.injectFeature({
      name: 'Foo',
      value: 'foo'
    })
    api.injectFeature({
      name: 'Bar',
      value: 'bar'
    })
    api.injectPrompt({
      name: 'customFoo',
      message: 'customFoo',
      when: answers => answers.features.includes('foo'),
      type: 'confirm'
    })
    api.injectPrompt({
      name: 'customBar',
      message: 'customBar',
      when: answers => answers.features.includes('bar'),
      type: 'list',
      choices: []
    })
    api.injectOptionForPrompt('customBar', {
      name: 'barChoice',
      value: 'barChoice'
    })
    api.onPromptComplete((answers, options) => {
      if (answers.features.includes('bar')) {
        options.plugins.bar = {}
      }
      if (answers.customBar === 'barChoice') {
        options.plugins.barChoice = {}
      }
    })
  }

  const expectedPrompts = [
    { choose: 1 },
    {
      message: 'Check the features',
      choices: ['Foo', 'Bar'],
      check: [1]
    },
    {
      message: 'customBar',
      choices: ['barChoice'],
      choose: 0
    },
    {
      message: 'package manager',
      choices: ['Yarn', 'NPM'],
      choose: 0
    },
    {
      message: 'Save the preferences',
      confirm: true
    }
  ]

  const expectedOptions = {
    packageManager: 'yarn',
    plugins: {
      bar: {},
      barChoice: {}
    }
  }

  await assertPromptModule(mockModule, expectedPrompts, expectedOptions)

  // should be saved now
  const expectedPromptsForSaved = [
    {
      choices: [
        'Use previously saved',
        'Zero-config',
        'Manually'
      ],
      choose: 0
    }
  ]
  await assertPromptModule([], expectedPromptsForSaved, expectedOptions)
})
