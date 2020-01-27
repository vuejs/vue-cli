jest.setTimeout(300000)
jest.mock('inquirer')

beforeEach(() => {
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true
})

const create = require('@vue/cli-test-utils/createUpgradableProject')
const { expectPrompts } = require('inquirer')

test('upgrade: should add eslint to devDependencies', async () => {
  const project = await create('plugin-eslint-v3.0', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.0.0'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies).not.toHaveProperty('eslint')

  expectPrompts([
    {
      message: `Your current ESLint version is v4`,
      confirm: false
    }
  ])

  await project.upgrade('eslint')

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.devDependencies.eslint).toMatch('^4')
})

test('upgrade: should upgrade eslint from v5 to v6', async () => {
  const project = await create('plugin-eslint-with-eslint-5', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.12.1',
        config: 'airbnb'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies.eslint).toMatch('^5')

  expectPrompts([
    {
      message: `Your current ESLint version is v5`,
      confirm: true
    }
  ])

  try {
    await project.upgrade('eslint')
  } catch (e) {
    // TODO:
    // Currently the `afterInvoke` hook will fail,
    // because deps are not correctly installed in test env.
    // Need to fix later.
  }

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.devDependencies.eslint).toMatch('^6')
  expect(updatedPkg.devDependencies).toHaveProperty('eslint-plugin-import')
})
