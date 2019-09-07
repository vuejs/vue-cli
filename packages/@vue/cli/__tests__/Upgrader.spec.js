const fs = require('fs')
const path = require('path')
const create = require('@vue/cli-test-utils/createTestProject')
const { logs } = require('@vue/cli-shared-utils')

const Upgrader = require('../lib/Upgrader')

jest.setTimeout(300000)

const outsideTestFolder = path.resolve(__dirname, '../../../../../vue-upgrade-tests')

beforeAll(() => {
  if (!fs.existsSync(outsideTestFolder)) {
    fs.mkdirSync(outsideTestFolder)
  }
})

beforeEach(() => {
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true
})

test('upgrade: plugin-babel v3.5', async () => {
  const project = await create('plugin-babel-legacy', {
    plugins: {
      '@vue/cli-plugin-babel': {
        version: '3.5.3'
      }
    }
  }, outsideTestFolder)

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.dependencies).not.toHaveProperty('core-js')

  await (new Upgrader(project.dir)).upgrade('babel', {})

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.dependencies).toHaveProperty('core-js')

  expect(logs.log.some(([msg]) => msg.match('core-js has been upgraded'))).toBe(true)

  // should have updated the version range in package.json
  expect(updatedPkg.devDependencies['@vue/cli-plugin-babel']).not.toMatch('3.5.3')
})

test('upgrade: plugin-babel with core-js 2', async () => {
  const project = await create('plugin-babel-v3', {
    plugins: {
      '@vue/cli-plugin-babel': {
        version: '3.8.0'
      }
    }
  }, outsideTestFolder)

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.dependencies['core-js']).toMatch('^2')

  await (new Upgrader(project.dir)).upgrade('babel', {})

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.dependencies['core-js']).toMatch('^3')
})

test('upgrade: should add eslint to devDependencies', async () => {
  const project = await create('plugin-eslint-v3.0', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.0.0'
      }
    }
  }, outsideTestFolder)

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies).not.toHaveProperty('eslint')

  await (new Upgrader(project.dir)).upgrade('eslint', {})

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.devDependencies.eslint).toMatch('^4')
})
