jest.setTimeout(200000)
const path = require('path')
const fs = require('fs-extra')

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const { loadModule } = require('@vue/cli-shared-utils')

let project
beforeAll(async () => {
  project = await create('service-esm-test', defaultPreset)
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.type = 'module'
  pkg.vue = { lintOnSave: 'default' }
  await project.write('package.json', JSON.stringify(pkg, null, 2))
  fs.renameSync(path.resolve(project.dir, 'babel.config.js'), path.resolve(project.dir, 'babel.config.cjs'))
})

const createService = async () => {
  const Service = loadModule('@vue/cli-service/lib/Service', project.dir)
  const service = new Service(project.dir, {
    plugins: [],
    useBuiltIn: false
  })
  await service.init()
  return service
}

test('load project options from package.json', async () => {
  const service = await createService()
  expect(service.projectOptions.lintOnSave).toBe('default')
})

test('load project options from vue.config.cjs', async () => {
  const configPath = path.resolve(project.dir, './vue.config.cjs')
  fs.writeFileSync(configPath, 'module.exports = { lintOnSave: true }')
  const service = await createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
  await fs.unlinkSync(configPath)
})

test('load project options from vue.config.cjs as a function', async () => {
  const configPath = path.resolve(project.dir, './vue.config.cjs')
  fs.writeFileSync(configPath, 'module.exports = function () { return { lintOnSave: true } }')
  const service = await createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
  await fs.unlinkSync(configPath)
})

test('load project options from vue.config.js', async () => {
  const configPath = path.resolve(project.dir, './vue.config.js')
  fs.writeFileSync(configPath, 'export default { lintOnSave: true }')
  const service = await createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
  await fs.unlinkSync(configPath)
})

test('load project options from vue.config.mjs', async () => {
  const configPath = path.resolve(project.dir, './vue.config.mjs')
  fs.writeFileSync(configPath, 'export default { lintOnSave: true }')
  const service = await createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
  await fs.unlinkSync(configPath)
})
