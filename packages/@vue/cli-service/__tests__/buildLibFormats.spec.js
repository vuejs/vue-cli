jest.setTimeout(40000)

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')

let project

beforeAll(async () => {
  project = await create('build-lib-formats', defaultPreset)
})

test('build as lib with default formats', async () => {
  const { stdout } = await project.run('vue-cli-service build --target lib --name testLib src/components/HelloWorld.vue')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/testLib.common.js')).toBe(true)
  expect(project.has('dist/testLib.umd.js')).toBe(true)
  expect(project.has('dist/testLib.umd.min.js')).toBe(true)
  expect(project.has('dist/testLib.css')).toBe(true)
})
test('build as lib with formats commonjs and umd', async () => {
  const { stdout } = await project.run('vue-cli-service build --target lib --formats commonjs,umd --name testLib src/components/HelloWorld.vue')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/testLib.common.js')).toBe(true)
  expect(project.has('dist/testLib.umd.js')).toBe(true)
  expect(project.has('dist/testLib.umd.min.js')).toBe(false)
  expect(project.has('dist/testLib.css')).toBe(true)
})

test('build as lib with format umd-min', async () => {
  const { stdout } = await project.run('vue-cli-service build --target lib --formats umd-min --name testLib src/components/HelloWorld.vue')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(false)
  expect(project.has('dist/testLib.common.js')).toBe(false)
  expect(project.has('dist/testLib.umd.js')).toBe(false)
  expect(project.has('dist/testLib.umd.min.js')).toBe(true)
  expect(project.has('dist/testLib.css')).toBe(true)
})

test('build as lib with unknown formats throws an error', async () => {
  try {
    await project.run('vue-cli-service build --target lib --formats umd,x,y --name testLib src/components/HelloWorld.vue')
  } catch (e) {
    expect(e.code).toBe(1)
    expect(e.failed).toBeTruthy()
  }
})
