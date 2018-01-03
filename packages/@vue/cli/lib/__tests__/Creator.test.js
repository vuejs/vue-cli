jest.mock('fs')
jest.mock('inquirer')

const Creator = require('../Creator')
const { defaults } = require('../options')
const { expectPrompts } = require('inquirer') // from mock

it('default', async () => {
  const creator = new Creator('test', '/', [])

  expectPrompts([
    {
      message: 'project creation mode',
      choices: [
        'Zero-config',
        'Manually select'
      ],
      choose: 0
    }
  ])

  const options = await creator.promptAndResolveOptions()
  expect(options).toEqual(defaults)
})

it('manual + PromptModuleAPI', async () => {
  const creator = new Creator('test', '/', [
    api => {
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
  ])

  expectPrompts([
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
  ])

  const options = await creator.promptAndResolveOptions()
  const expectedOptions = {
    packageManager: 'yarn',
    plugins: {
      bar: {},
      barChoice: {}
    }
  }
  expect(options).toEqual(expectedOptions)

  // should be saved now
  expectPrompts([
    {
      choices: [
        'Use previously saved',
        'Zero-config',
        'Manually'
      ],
      choose: 0
    }
  ])
  const newCreator = new Creator('test', '/', [])
  const newOptions = await newCreator.promptAndResolveOptions()
  expect(newOptions).toEqual(expectedOptions)
})
