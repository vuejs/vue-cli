// using this requires mocking fs & inquirer

const Creator = require('@vue/cli/lib/Creator')
const { loadOptions } = require('@vue/cli/lib/options')
const { expectPrompts } = require('inquirer') // from mock

module.exports = async function assertPromptModule (
  module,
  expectedPrompts,
  expectedOptions,
  opts = {}
) {
  // auto fill non-module prompts
  if (opts.pluginsOnly) {
    expectedPrompts.unshift(
      {
        message: 'Please pick a preset',
        choose: 1
      }
    )
    expectedPrompts.push(
      {
        message: 'Where do you prefer placing config',
        choose: 1 // package.json
      },
      {
        message: 'Save this as a preset',
        confirm: false
      }
    )
    if (!loadOptions().packageManager) {
      expectedPrompts.push({
        message: 'package manager',
        choose: 0 // yarn
      })
    }
  }

  expectPrompts(expectedPrompts)
  const creator = new Creator('test', '/', [].concat(module))
  const preset = await creator.promptAndResolvePreset()

  if (opts.pluginsOnly) {
    delete preset.useConfigFiles
  }
  expect(preset).toEqual(expectedOptions)
}
