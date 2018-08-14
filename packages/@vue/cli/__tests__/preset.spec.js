jest.mock('inquirer')
const { expectPrompts } = require('inquirer')

const path = require('path')
const fs = require('fs-extra')
const create = require('@vue/cli/lib/create')

test('fetching local preset with prompts and generator', async () => {
  const cwd = path.resolve(__dirname, '../../../test')
  const name = 'test-preset'

  expectPrompts([{
    message: 'Are you ok',
    confirm: true
  }])

  await create(
    name,
    {
      force: true,
      git: false,
      cwd,
      preset: path.resolve(__dirname, './mock-preset')
    }
  )

  const testFile = await fs.readFile(path.resolve(cwd, name, 'test.js'), 'utf-8')
  expect(testFile).toBe('true')

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@vue/cli-plugin-babel')
})
