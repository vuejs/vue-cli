const { join } = require('path')
const Service = require('../lib/Service')

const mockDir = join(__dirname, 'mockESM')
const configPath = join(mockDir, 'vue.config.cjs')

const createService = () => {
  const service = new Service(mockDir, {
    plugins: [],
    useBuiltIn: false
  })
  service.init()
  return service
}

// vue.config.cjs has higher priority

test('load project options from package.json', async () => {
  const service = createService()
  expect(service.projectOptions.lintOnSave).toBe('default')
})

test('load project options from vue.config.cjs', async () => {
  jest.mock(configPath, () => ({ lintOnSave: true }), { virtual: true })
  const service = createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
})

test('load project options from vue.config.cjs as a function', async () => {
  jest.mock(configPath, () => function () { return { lintOnSave: true } }, { virtual: true })
  const service = createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
})
