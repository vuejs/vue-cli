jest.setTimeout(30000)

const path = require('path')

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
// const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

const { hashElement } = require('folder-hash')

test('should build with cache on two consecutive runs', async () => {
  const project = await create('cache-basic', defaultPreset)
  const cacheDir = path.join(project.dir, './node_modules/.cache')

  await project.run('vue-cli-service build')
  const cacheHash = await hashElement(cacheDir)

  await project.run('vue-cli-service build')
  const newCacheHash = await hashElement(cacheDir)

  expect(newCacheHash).toEqual(cacheHash)

  // TODO: the mtime of the files in each of the sub directories should not change
})

test.todo('should ignore serve cache when `--no-cache` argument is passed')

test.todo('should ignore build cache when `--no-cache` argument is passed')

test.todo('should ignore test cache when `--no-cache` argument is passed')

test('should ignore previous cache when `--mode` argument changed', async () => {
  const project = await create('cache-mode', defaultPreset)
  const cacheDir = path.join(project.dir, './node_modules/.cache')

  await project.run('vue-cli-service build')
  const cacheHash = await hashElement(cacheDir)

  await project.run('vue-cli-service build --mode development')
  const newCacheHash = await hashElement(cacheDir)

  expect(newCacheHash).not.toEqual(cacheHash)
})

test.todo('should ignore previous cache when corresponding `.env` file changed')

test.todo('should not ignore previous cache when irrelevant `.env` file changed')

test.todo('should ignore previous cache when `--target` argument changed')

test.todo('should ignore previous cache when `--module` flag is changed')

test.todo('should ignore previous cache when `package.json` changed')

test.todo('should ignore previous cache when lockfiles changed')

test.todo('should ignore previous cache when Vue CLI config file changed')

test.todo('should ignore previous cache when babel config changed')

test.todo('should ignore previous cache when tsconfig.json changed')
