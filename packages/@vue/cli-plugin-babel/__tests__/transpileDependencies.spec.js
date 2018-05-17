jest.setTimeout(30000)

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')

let project

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

  let $packageJson = await project.read('package.json')

  $packageJson = JSON.parse($packageJson)
  $packageJson.dependencies['external-dep'] = '1.0.0'
  $packageJson = JSON.stringify($packageJson)

  await project.write(
    'package.json',
    $packageJson
  )

  let $mainjs = await project.read('src/main.js')

  $mainjs = `import test from 'external-dep'\n${$mainjs}\nconsole.log(test())`

  await project.write(
    'src/main.js',
    $mainjs
  )
})

test('dep from node_modules should not been transpiled', async () => {
  const { stdout } = await project.run('vue-cli-service build')

  let $vendorjs = stdout.match(/(js\/vendors~app\.[^.]+\.js)/)[1]

  $vendorjs = `dist/${$vendorjs}`
  $vendorjs = await project.read($vendorjs)

  expect($vendorjs).toMatch('() => "__TEST__"')
})

test('dep from node_modules should been transpiled', async () => {
  await project.write(
    'vue.config.js',
    `module.exports = { transpileDependencies: ['external-dep'] }`
  )

  const { stdout } = await project.run('vue-cli-service build')

  let $vendorjs = stdout.match(/(js\/vendors~app\.[^.]+\.js)/)[1]

  $vendorjs = `dist/${$vendorjs}`
  $vendorjs = await project.read($vendorjs)

  expect($vendorjs).toMatch('return "__TEST__"')
})
