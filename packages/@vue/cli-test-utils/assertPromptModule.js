// using this requires mocking fs & inquirer

const Creator = require('@vue/cli/lib/Creator')
const { expectPrompts } = require('inquirer') // from mock

module.exports = async function assertPromptModule (
  module,
  expectedPrompts,
  expectedOptions,
  opts = {}
) {
  // auto fill non-module prompts
  if (opts.plguinsOnly) {
    expectedPrompts.unshift(
      {
        message: 'project creation mode',
        choose: 1
      }
    )
    expectedPrompts.push(
      {
        message: 'package manager',
        choose: 0
      },
      {
        message: 'Save the preferences',
        confirm: false
      }
    )
  }

  expectPrompts(expectedPrompts)
  const creator = new Creator('test', '/', [].concat(module))
  const options = await creator.promptAndResolveOptions()

  if (opts.plguinsOnly) {
    delete options.packageManager
  }
  expect(options).toEqual(expectedOptions)
}
