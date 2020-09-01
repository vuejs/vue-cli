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

test('should recognize generator/index.js in a local preset directory', async () => {
  const cwd = path.resolve(__dirname, '../../../test')
  const name = 'test-preset-template'

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
      preset: path.resolve(__dirname, './mock-preset-with-template')
    }
  )

  const testFile = await fs.readFile(path.resolve(cwd, name, 'test.js'), 'utf-8')
  expect(testFile).toBe('true\n')

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@vue/cli-plugin-babel')
})

test('should recognize generator/index.js in a local preset directory by async generatory', async () => {
  const cwd = path.resolve(__dirname, '../../../test')
  const name = 'test-preset-template-async-generator'

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
      preset: path.resolve(__dirname, './mock-preset-with-async-generator')
    }
  )

  const testFile = await fs.readFile(path.resolve(cwd, name, 'test.js'), 'utf-8')
  expect(testFile).toBe('true\n')

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@vue/cli-plugin-babel')
  expect(pkg.devDependencies).toHaveProperty('vue-cli-plugin-async-generator')
  expect(pkg.scripts).toHaveProperty('testasync')

  // as the package.json includes a made-up dep, it may interfere with other tests that requires installation
  await fs.remove(path.resolve(cwd, name, 'package.json'))
})

test('should not override the README.md generated by plugins', async () => {
  const cwd = path.resolve(__dirname, '../../../test')
  const name = 'test-preset-readme'

  await create(
    name,
    {
      force: true,
      git: false,
      cwd,
      preset: path.resolve(__dirname, './mock-preset-with-readme')
    }
  )

  const readme = await fs.readFile(path.resolve(cwd, name, 'README.md'), 'utf-8')
  expect(readme).toBe('hello')

  const pkg = require(path.resolve(cwd, name, 'package.json'))
  expect(pkg.devDependencies).toHaveProperty('@vue/cli-plugin-babel')
})
