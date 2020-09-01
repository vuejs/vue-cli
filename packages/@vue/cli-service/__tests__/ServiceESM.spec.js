const Service = require('../lib/Service')

const path = require('path')
const configPath = path.resolve('/', 'vue.config.cjs')

jest.mock('fs')
const fs = require('fs')

beforeEach(() => {
  fs.writeFileSync(path.resolve('/', 'package.json'), JSON.stringify({
    type: 'module',
    vue: {
      lintOnSave: 'default'
    }
  }, null, 2))
})

afterEach(() => {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath)
  }
})

const createService = () => {
  const service = new Service('/', {
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
  fs.writeFileSync(configPath, '')
  jest.mock(configPath, () => ({ lintOnSave: true }), { virtual: true })
  const service = createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
})

test('load project options from vue.config.cjs as a function', async () => {
  fs.writeFileSync(configPath, '')
  jest.mock(configPath, () => function () { return { lintOnSave: true } }, { virtual: true })
  const service = createService()
  expect(service.projectOptions.lintOnSave).toBe(true)
})
