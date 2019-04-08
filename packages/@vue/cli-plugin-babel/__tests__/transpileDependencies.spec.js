jest.setTimeout(30000)

const fs = require('fs-extra')
const path = require('path')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')

let project

async function readVendorFile () {
  const files = await fs.readdir(path.join(project.dir, 'dist/js'))
  const filename = files.find(f => /chunk-vendors\.[^.]+\.js$/.test(f))
  return project.read(`dist/js/${filename}`)
}

beforeAll(async () => {
  project = await create('babel-transpile-deps', defaultPreset)

  await project.write(
    'node_modules/external-dep/package.json',
    `{ "name": "external-dep", "version": "1.0.0", "main": "index.js" }`
  )

  await project.write(
    'node_modules/external-dep/index.js',
    `const test = () => "__TEST__";\nexport default test`
  )

  await project.write(
    'node_modules/@scope/external-dep/package.json',
    `{ "name": "@scope/external-dep", "version": "1.0.0", "main": "index.js" }`
  )

  await project.write(
    'node_modules/@scope/external-dep/index.js',
    `const test = () => "__SCOPE_TEST__";\nexport default test`
  )

  let $packageJson = await project.read('package.json')

  $packageJson = JSON.parse($packageJson)
  $packageJson.dependencies['external-dep'] = '1.0.0'
  $packageJson.dependencies['@scope/external-dep'] = '1.0.0'
  $packageJson = JSON.stringify($packageJson)

  await project.write(
    'package.json',
    $packageJson
  )

  let $mainjs = await project.read('src/main.js')

  $mainjs = `
  import test from 'external-dep'
  import scopeTest from '@scope/external-dep'
  ${$mainjs}
  test()
  scopeTest()`

  await project.write(
    'src/main.js',
    $mainjs
  )
})

test('dep from node_modules should not been transpiled', async () => {
  await project.run('vue-cli-service build')
  expect(await readVendorFile()).toMatch('() => "__TEST__"')
})

test('dep from node_modules should been transpiled', async () => {
  await project.write(
    'vue.config.js',
    `module.exports = { transpileDependencies: ['external-dep', '@scope/external-dep'] }`
  )
  await project.run('vue-cli-service build')
  expect(await readVendorFile()).toMatch('return "__TEST__"')

  expect(await readVendorFile()).toMatch('return "__SCOPE_TEST__"')
})

// https://github.com/vuejs/vue-cli/issues/3057
test('only transpile package with same name specified in transpileDependencies', async () => {
  await project.write(
    'vue.config.js',
    `module.exports = { transpileDependencies: ['babel-transpile-deps'] }`
  )
  try {
    await project.run('vue-cli-service build')
  } catch (e) {}
  expect(await readVendorFile()).toMatch('() => "__TEST__"')
  expect(await readVendorFile()).toMatch('() => "__SCOPE_TEST__"')
})
